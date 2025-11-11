const mongoose = require("mongoose");
const Conversation = require("../models/Conversations");
const Message = require("../models/Message");
const Product = require("../models/Product");
const chatMetrics = require("../utils/chat.metrics");
const { groupMessagesByDate } = require("../utils/formatDate");
const chatCache = require("../redis/chat.cache");
const { executeWithRetry } = require("../helper/transaction.helper");
const { markMessagesAsReadAsync } = require("./shared.chat.controller");
const User = require("../models/User");

/**
 * Send message with product reference to seller
 */
const sendChatWithProduct = async (req, res) => {
  const startTime = Date.now();

  try {
    const { sellerId, productId } = req.params;
    const customerId = req.user._id;

    console.log("DEBUG: customerId:", customerId, "sellerId:", sellerId, "productId:", productId);

    // Validate seller exists and has seller role
    const seller = await User.findById(sellerId).select('_id role name');
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }
    if (seller.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: "User is not a seller",
      });
    }

    // Validate product exists and belongs to seller
    const product = await Product.findById(productId).select('_id seller_id product_name');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (product.seller_id.toString() !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "Product does not belong to this seller",
      });
    }

    // Use executeWithRetry for automatic retries on temporary errors
    const result = await executeWithRetry(async (session) => {
      const { message } = req.body;
      let conversation;
      let imageUrls = [];
      let productData = null;

      // Process uploaded images
      if (req.files && req.files.length > 0) {
        imageUrls = req.files.map((file) => file.path);
      }

      // Get product info if provided (only needed fields)
      if (productId) {
        productData = await Product.findById(productId, {
          product_name: 1,
          price: 1,
          imageurl: 1,
        })
          .lean()
          .session(session);
      }

      // Find existing conversation with projection
      conversation = await Conversation.findOne(
        {
          participants: { $all: [customerId, sellerId] },
        },
        { _id: 1, products: 1 }
      ).session(session);

      if (!conversation) {
        // Create new conversation
        conversation = await Conversation.create(
          [
            {
              participants: [customerId, sellerId],
              products: productId ? [{ productId, addedAt: new Date() }] : [],
              isActive: true,
            },
          ],
          { session }
        );
        conversation = conversation[0];
      } else if (productId) {
        // Check if product already exists in conversation
        const productExists = conversation.products.some(
          (p) => p.productId.toString() === productId
        );

        if (!productExists) {
          await Conversation.updateOne(
            { _id: conversation._id },
            { $push: { products: { productId, addedAt: new Date() } } },
            { session }
          );
        }
      }

      // Create new messages
      const newMessages = [];

      // Create text message if provided
      if (message && message.trim()) {
        const messageData = {
          senderId: customerId,
          receiverId: sellerId,
          content: message.trim(),
          status: "sent",
          conversationId: conversation._id,
        };

        // Add product reference if present
        if (productData) {
          messageData.productRef = {
            productId: productId,
            productSnapshot: {
              title: productData.product_name,
              price: productData.price,
              imageUrl: productData.imageurl || null,
            },
          };
        }

        const textMessage = await Message.create([messageData], { session });
        newMessages.push(textMessage[0]);
      }

      // Create image message if provided
      if (imageUrls.length > 0) {
        const imageMessage = await Message.create(
          [
            {
              senderId: customerId,
              receiverId: sellerId,
              imagesUrl: imageUrls,
              status: "sent",
              conversationId: conversation._id,
              productRef: productData
                ? {
                    productId: productId,
                    productSnapshot: {
                      title: productData.product_name,
                      price: productData.price,
                      imageUrl: productData.imageurl || null,
                    },
                  }
                : undefined,
            },
          ],
          { session }
        );
        newMessages.push(imageMessage[0]);
      }

      // Update conversation's last message
      if (newMessages.length > 0) {
        const lastMessageId = newMessages[newMessages.length - 1]._id;
        await Conversation.findByIdAndUpdate(
          conversation._id,
          { lastMessage: lastMessageId },
          { session }
        );
      }

      return {
        conversation: conversation._id,
        messages: newMessages,
      };
    });

    // Invalidate messages cache for this conversation
    await chatCache.invalidateConversationMessages(
      result.conversation.toString()
    );
    await chatCache.incrementUnreadCount(
      result.conversation.toString(),
      sellerId
    );

    // Process Socket.IO notifications in background to avoid blocking response
    if (req.io && result.messages.length > 0) {
      process.nextTick(() => {
        try {
          result.messages.forEach((msg) => {
            req.io.emit(`message:${sellerId}`, {
              message: msg,
              conversation: result.conversation,
              type: "new_message",
            });
          });
        } catch (socketError) {
          console.error("Socket notification error:", socketError);
        }
      });
    }

    // Track performance
    chatMetrics.trackSendMessage(startTime);

    return res.status(201).json({
      success: true,
      data: {
        conversation: result.conversation,
        messages: result.messages,
      },
    });
  } catch (error) {
    console.error("Error in sendChatWithProduct:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send message",
      error: error.message,
    });
  }
};

/**
 * Send message to seller from an existing conversation
 */
const sendChatToSeller = async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, conversationId, sellerId } = req.body;
    const customerId = req.user._id;

    // Use transaction with retry for reliability
    const result = await executeWithRetry(async (session) => {
      const imageUrls = [];

      // Process uploaded images
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          imageUrls.push(file.path);
        });
      }

      // Find existing conversation
      let conversation = await Conversation.findOne({
        _id: conversationId,
      }).session(session);

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Create new messages
      const newMessages = [];

      // Add text message if provided
      if (message && message.trim()) {
        const messageData = {
          senderId: customerId,
          receiverId: sellerId,
          content: message.trim(),
          status: "sent",
          conversationId: conversation._id,
          productRef: null,
        };
        const textMessage = await Message.create([messageData], { session });
        newMessages.push(textMessage[0]);
      }

      // Add image message if provided
      if (imageUrls.length > 0) {
        const imageMessage = await Message.create(
          [
            {
              senderId: customerId,
              receiverId: sellerId,
              imagesUrl: imageUrls,
              status: "sent",
              conversationId: conversation._id,
              productRef: null,
            },
          ],
          { session }
        );
        newMessages.push(imageMessage[0]);
      }

      // Update conversation with last message
      if (newMessages.length > 0) {
        const lastMessageId = newMessages[newMessages.length - 1]._id;
        await Conversation.findByIdAndUpdate(
          conversation._id,
          { lastMessage: lastMessageId },
          { session }
        );
      }

      return {
        conversation: conversation._id,
        messages: newMessages,
      };
    });

    // Invalidate only messages cache
    await chatCache.invalidateConversationMessages(conversationId);
    await chatCache.incrementUnreadCount(conversationId, sellerId);

    // Track performance
    chatMetrics.trackSendMessage(startTime);

    return res.status(201).json({
      success: true,
      data: {
        conversation: result.conversation,
        messages: result.messages,
      },
    });
  } catch (error) {
    console.error("Error in sendChatToSeller:", error);
    return res.status(500).json({
      success: false,
      message: "Could not process the message",
      error: error.message,
    });
  }
};

/**
 * Get conversations for buyer (with stores info)
 */
const getCustomerConversations = async (req, res) => {
  const startTime = Date.now();
  const customerId = req.user._id;

  try {
    // Get conversations with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: customerId,
      isActive: true,
    })
      .populate({
        path: "participants",
        select: "name picture_avatar",
        match: { _id: { $ne: customerId } },
      })
      .populate({
        path: "lastMessage",
        select: "content createdAt status imagesUrl senderId",
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Conversation.countDocuments({
      participants: customerId,
      isActive: true,
    });

    // Extract all conversation IDs for batch unread count
    const conversationIds = conversations.map((conv) => conv._id);

    // Get all unread counts in one query
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversationIds },
          receiverId: customerId,
          status: { $ne: "read" },
        },
      },
      {
        $group: {
          _id: "$conversationId",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to map for O(1) lookup
    const unreadMap = {};
    unreadCounts.forEach((item) => {
      unreadMap[item._id.toString()] = item.count;
    });

    // Format the response
    const formattedConversations = conversations.map((conv) => {
      const seller = conv.participants[0] || {
        fullname: "Unknown",
        avatar: null,
      };

      return {
        _id: conv._id,
        seller: seller,
        // store: store || { name: "Unknown Store", logo: null },
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
        unreadCount: unreadMap[conv._id.toString()] || 0,
      };
    });

    // Create pagination metadata
    const pagination = {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      hasNextPage: skip + limit < totalCount,
      hasPrevPage: page > 1,
    };

    const responseData = {
      success: true,
      data: formattedConversations,
      pagination,
    };

    // Track performance
    chatMetrics.trackGetCustomerConversations(startTime);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching buyer conversations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

/**
 * Get conversation messages for buyer
 */
const getConversationMessagesCustomer = async (req, res) => {
  const startTime = Date.now();

  try {
    const { conversationId } = req.params;
    const customerId = req.user._id;

    // Validate conversationId
    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Get page and limit from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Build cache key
    const cacheKey = `customer:messages:${conversationId}:${customerId}:${page}:${limit}`;

    // Try getting from cache first
    const cachedMessages = await chatCache.getMessages(
      conversationId,
      page,
      limit
    );

    if (cachedMessages) {
      // Still mark messages as read in background
      markMessagesAsReadAsync(conversationId, customerId, req.io);
      chatMetrics.trackCacheHit("customer_messages");

      // Verify user belongs to this conversation - only basic check, don't populate
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: customerId,
      }).populate({
        path: "products.productId",
        select: "product_name price imageurl",
      });

      if (!conversation) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this conversation",
        });
      }

      // Identify current product being discussed
      const products = conversation.products || [];
      const currentProduct =
        products.length > 0
          ? products.sort((a, b) => b.addedAt - a.addedAt)[0]
          : null;

      // Return cached messages with fresh conversation data
      return res.status(200).json({
        success: true,
        data: {
          messages: cachedMessages.messages,
          conversation,
          currentProduct,
          pagination: cachedMessages.pagination,
        },
      });
    }

    // Verify user belongs to this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: customerId,
    }).populate({
      path: "products.productId",
      select: "product_name price imageurl",
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this conversation",
      });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Find the seller
    const sellerId = conversation.participants.find(
      (participant) => participant.toString() !== customerId.toString()
    );

    // Get messages
    const messages = await Message.find({
      conversationId: conversationId,
    })
      .sort({ createdAt: -1 }) // Most recent first for pagination
      .skip(skip)
      .limit(limit)
      .populate({
        path: "senderId",
        select: "_id name picture_avatar",
      })
      .lean();

    // Count total messages for pagination
    const totalMessages = await Message.countDocuments({
      conversationId: conversationId,
    });

    // Reverse messages to chronological order
    const orderedMessages = messages.reverse();

    // Group messages by date
    const messagesByDate = groupMessagesByDate(orderedMessages);

    // Identify current product being discussed
    const products = conversation.products || [];
    const currentProduct =
      products.length > 0
        ? products.sort((a, b) => b.addedAt - a.addedAt)[0]
        : null;

    // Mark messages as read in background
    markMessagesAsReadAsync(conversationId, customerId, req.io);

    // Create pagination metadata
    const pagination = {
      page,
      limit,
      totalPages: Math.ceil(totalMessages / limit),
      totalItems: totalMessages,
      hasNextPage: skip + limit < totalMessages,
      hasPrevPage: page > 1,
    };

    // Cache the messages (not the entire response)
    await chatCache.setMessages(
      conversationId,
      orderedMessages,
      messagesByDate,
      pagination,
      page,
      limit
    );

    // Prepare response
    const responseData = {
      success: true,
      data: {
        messages: orderedMessages,
        conversation,
        currentProduct,
        pagination,
      },
    };

    // Track performance
    chatMetrics.trackGetMessages(startTime);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

/**
 * Get conversation detail by seller ID for buyer
 */
const getConversationDetailCustomer = async (req, res) => {
  const startTime = Date.now();

  try {
    const userId = req.user._id;
    const { sellerId } = req.query;
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "sellerId is required",
      });
    }

    // Find conversation between buyer and seller
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, sellerId] },
      isActive: true,
    })
      .populate({
        path: "participants",
        select: "_id name picture_avatar",
      })
      .populate({
        path: "lastMessage",
        select: "content imagesUrl senderId status createdAt",
      })
      .populate({
        path: "products.productId",
        select: "product_name price imageurl",
      })
      .lean();

    if (!conversation) {
      return res.status(200).json({
        success: false,
        message: "No conversation found between customer and seller",
      });
    }

    // Get conversation messages
    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .populate({
        path: "senderId",
        select: "_id name picture_avatar",
      })
      .lean();

    // Mark messages as read
    markMessagesAsReadAsync(conversation._id, userId, req.io);

    // Group messages by date
    const messagesByDate = groupMessagesByDate(messages);

    const responseData = {
      success: true,
      data: {
        conversation: conversation,
        messages: messages,
        messagesByDate: messagesByDate,
      },
    };

    // Track performance
    chatMetrics.trackGetConversationDetail(startTime);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getConversationDetailCustomer:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving conversation details",
      error: error.message,
    });
  }
};

module.exports = {
  sendChatWithProduct,
  sendChatToSeller,
  getCustomerConversations,
  getConversationMessagesCustomer,
  getConversationDetailCustomer,
};
