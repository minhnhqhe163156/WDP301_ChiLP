// src/components/chat/ChatApp.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Package } from "lucide-react";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { useAuth } from '../../contexts/AuthContext';
import {
  apimarkMessagesAsRead,
  getCustomerConversations,
  getConversationHistory,
} from "../../api/chat";
import {
  initSocket,
  subscribeToMessages,
  subscribeToReadReceipts,
  subscribeToUserStatus,
  autoMarkAsRead,
  joinConversation,
  subscribeToTypingStatus,
} from "../../utils/socketService";
import "./ChatMessage.css";
import axios from "axios";

const ChatApp = () => {
  // State Management
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [currentSellerId, setCurrentSellerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [expandedOptions, setExpandedOptions] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [sellerStatus, setSellerStatus] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const currentConversationRef = useRef(null);

  // Lấy user và loading từ AuthContext
  const { user, loading } = useAuth();
  const userId = user?._id;

  // Always call hooks at the top level
  useEffect(() => {
    if (loading || !user) return;
    fetchConversations();
    currentConversationRef.current = currentConversation;
  }, [loading, user, currentConversation]);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket
    const socket = initSocket(user);

    // Subscribe to new messages
    const unsubscribeMessages = subscribeToMessages(userId, (data) => {
      if (data.type === "new_message") {
        handleNewMessage(data);
      }
    });

    // Subscribe to read receipts
    const unsubscribeReadReceipts = subscribeToReadReceipts(userId, (data) => {
      if (data.type === "messages_read") {
        handleReadReceipts(data);
      }
    });

    // Subscribe to typing status
    socket.on("typing", (data) => {
      if (data.conversationId && data.userId !== userId) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.conversationId]: true,
        }));
      }
    });

    socket.on("stop_typing", (data) => {
      if (data.conversationId && data.userId !== userId) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.conversationId]: false,
        }));
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeReadReceipts();
      unsubscribeMessages();
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    console.log("Đăng ký lắng nghe sự kiện typing status cho user:", userId);

    const unsubscribeTyping = subscribeToTypingStatus(userId, (data) => {
      console.log("Nhận được sự kiện typing:", data);

      if (!data.userId || !data.conversationId) {
        console.error("Dữ liệu typing không hợp lệ:", data);
        return;
      }

      setTypingUsers((prev) => {
        const newState = {
          ...prev,
          [data.userId]: data.isTyping,
        };
        console.log("Cập nhật trạng thái typing users:", newState);
        return newState;
      });

      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => {
            if (prev[data.userId]) {
              console.log(
                "Tự động xóa trạng thái typing sau 10s:",
                data.userId
              );
              return {
                ...prev,
                [data.userId]: false,
              };
            }
            return prev;
          });
        }, 10000);
      }
    });

    return () => {
      console.log("Hủy đăng ký lắng nghe typing status");
      if (unsubscribeTyping) unsubscribeTyping();
    };
  }, [userId]);

  useEffect(() => {
    if (currentSellerId) {
      const unsubscribeStatus = subscribeToUserStatus(
        currentSellerId,
        (status) => {
          setSellerStatus((prev) => ({
            ...prev,
            [currentSellerId]: status.isOnline,
          }));
        }
      );

      return () => {
        if (unsubscribeStatus) unsubscribeStatus();
      };
    }
  }, [currentSellerId]);

  // FIXED: markConversationAsRead với kiểm tra an toàn
  const markConversationAsRead = async (conversationId, sellerId) => {
    if (!userId || !conversationId) return;

    try {
      await apimarkMessagesAsRead(conversationId);

      if (sellerId) {
        autoMarkAsRead(conversationId, userId, sellerId);
      }

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === conversationId
            ? { ...conv, unread: false, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  useEffect(() => {
    if (!currentConversation || !userId) return;

    const fetchData = async () => {
      try {
        joinConversation(currentConversation, userId);
        const response = await getConversationHistory(currentConversation);

        if (response.success) {
          // FIXED: Sử dụng userId thay vì user._id
          const customerId = userId;
          const formattedMessages = [];
          let currentProductId = null;

          response.data.messagesByDate.forEach((dayGroup) => {
            formattedMessages.push({
              id: `date-${dayGroup.date}`,
              type: "system",
              displayText: dayGroup.displayText,
              timestamp: new Date(dayGroup.date),
            });

            dayGroup.messages.forEach((msg) => {
              if (
                msg.productRef &&
                msg.productRef.productId &&
                currentProductId !== msg.productRef.productId
              ) {
                currentProductId = msg.productRef.productId;
                formattedMessages.push({
                  id: `product-banner-${currentProductId}-${msg._id}`,
                  type: "product-banner",
                  productRef: msg.productRef,
                });
              }

              // FIXED: Kiểm tra senderId an toàn
              const isCustomer = msg.senderId?._id === customerId;
              const messageTime = new Date(msg.timestamp || msg.createdAt);
              const formattedTime = messageTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              formattedMessages.push({
                id: msg._id,
                sender: isCustomer ? 'customer' : 'seller',
                content: msg.content || "",
                text: msg.content || "",
                images: msg.imagesUrl ? msg.imagesUrl : [],
                image: msg.imageUrl,
                time: formattedTime,
                isRead: msg.status === "read",
                status: msg.status,
                productRef: msg.productRef,
                product: msg.productRef
                  ? {
                      title: msg.productRef.productSnapshot.title,
                      price: msg.productRef.productSnapshot.price,
                      imageUrl: msg.productRef.productSnapshot.imageUrl,
                      productId: msg.productRef.productId,
                    }
                  : null,
                productId: msg.productRef ? msg.productRef.productId : null,
              });
            });
          });

          setMessages(formattedMessages);
          markConversationAsRead(currentConversation, currentSellerId);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Không thể tải tin nhắn");
      }
    };

    fetchData();
  }, [currentConversation, userId]);

  // Hiển thị loading khi đang lấy user
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }
  // Nếu chưa đăng nhập
  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Bạn chưa đăng nhập!</p>
        </div>
      </div>
    );
  }

  // FIXED: handleNewMessage với kiểm tra an toàn
  const handleNewMessage = (data) => {
    if (!userId || !data?.message) return;

    const { message, conversation: conversationId } = data;

    // Add message to current conversation if it's active
    if (currentConversationRef.current === conversationId) {
      const messageTime = new Date(message.timestamp || message.createdAt);
      const formattedTime = messageTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: message._id,
          content: message.content || "",
          sender: "user",
          text: message.content || "",
          images: message.imagesUrl,
          time: formattedTime,
          isRead: false,
          status: "sent",
          productRef: message.productRef,
        },
      ]);

      apimarkMessagesAsRead(conversationId);

      // FIXED: Kiểm tra senderId an toàn
      if (message.senderId && message.senderId !== userId) {
        autoMarkAsRead(conversationId, userId, message.senderId);
      }
    }

    updateConversationWithNewMessage(conversationId, message);
  };

  const handleReadReceipts = (data) => {
    if (!userId || !data) return;

    const { conversationId, readBy, readAt } = data;

    if (currentConversationRef.current === conversationId) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.sender === "me" && msg.status !== "read") {
            console.log("Cập nhật tin nhắn đã đọc:", msg.id);
            return { ...msg, isRead: true, status: "read", readAt };
          }
          return msg;
        })
      );
    }

    updateConversationReadStatus(conversationId, readBy);
  };

  const updateConversationReadStatus = (conversationId, readBy) => {
    if (!userId) return;

    setConversations((prevConversations) =>
      prevConversations.map((conv) => {
        if (conv.id === conversationId && readBy !== userId) {
          return {
            ...conv,
            lastMessageRead: true,
          };
        }
        return conv;
      })
    );
  };

  // FIXED: updateConversationWithNewMessage với kiểm tra an toàn
  const updateConversationWithNewMessage = (conversationId, message) => {
    if (!userId || !message) return;

    setConversations((prevConversations) => {
      const existingConversation = prevConversations.find(
        (c) => c.id === conversationId
      );

      if (!existingConversation) {
        fetchConversations();
        return prevConversations;
      }

      return prevConversations.map((conv) => {
        if (conv.id === conversationId) {
          // FIXED: Kiểm tra senderId an toàn
          const isFromMe = message.senderId === userId;
          const newUnreadCount = isFromMe
            ? 0
            : currentConversationRef.current === conversationId
            ? 0
            : (conv.unreadCount || 0) + 1;

          return {
            ...conv,
            lastMessage: message.content || "[Hình ảnh]",
            sender: isFromMe ? "me" : "user",
            time: formatTime(new Date(message.timestamp || message.createdAt)),
            unread:
              !isFromMe && currentConversationRef.current !== conversationId,
            unreadCount: newUnreadCount,
          };
        }
        return conv;
      });
    });
  };

  // FIXED: fetchConversations với kiểm tra an toàn
  const fetchConversations = async () => {
    if (!userId) return;

    try {
      console.log("Token gửi lên:", axios.defaults.headers.common['Authorization']);
      const response = await getCustomerConversations();
      if (response.success) {
        const formattedConversations = response.data.map((conversation) => ({
          id: conversation._id,
          name: conversation.seller?.name || "Unknown Store",
          sellerRole: conversation.seller?.role || null,
          avatar:
            conversation.store?.bannerImageURL || "/api/placeholder/40/40",
          lastMessage: conversation.lastMessage?.content || "[Hình ảnh]",
          time: formatTime(conversation.updatedAt),
          unread: conversation.unreadCount > 0,
          unreadCount: conversation.unreadCount,
          sellerId: conversation.seller?._id,
          // FIXED: Kiểm tra senderId an toàn
          sender:
            conversation?.lastMessage?.senderId === userId ? "me" : "user",
          status: sellerStatus[conversation.seller?._id] ? "Online" : "Offline",
        }));

        setConversations(formattedConversations);

        // Subscribe to seller status
        formattedConversations.forEach((conv) => {
          if (conv.sellerId) {
            subscribeToUserStatus(conv.sellerId, (status) => {
              setSellerStatus((prev) => ({
                ...prev,
                [conv.sellerId]: status.isOnline,
              }));
              setConversations((prevConversations) =>
                prevConversations.map((c) =>
                  c.sellerId === conv.sellerId
                    ? { ...c, status: status.isOnline ? "Online" : "Offline" }
                    : c
                )
              );
            });
          }
        });
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Không thể tải cuộc trò chuyện. Vui lòng thử lại sau.");
    }
  };

  // Component hiển thị banner sản phẩm
  const ProductBanner = ({ productRef }) => {
    if (!productRef?.productSnapshot) return null;

    const product = productRef.productSnapshot;

    return (
      <div className="my-4 bg-white rounded-lg p-3 border border-gray-200 max-w-md mx-auto">
        <div className="text-sm text-gray-500 mb-2">
          Bạn đang trao đổi với Người bán về sản phẩm này
        </div>
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={24} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-1 line-clamp-2">
              {product.title}
            </div>
            <div>
              <span className="text-red-600">
                ₫{product.price?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component hiển thị tin nhắn hệ thống
  const SystemMessage = ({ displayText }) => (
    <div className="py-3 flex justify-center">
      <div className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
        {displayText}
      </div>
    </div>
  );

  // Format time for conversation list
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays < 7) {
      return diffDays.toString();
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  };

  // FIXED: handleSelectConversation với kiểm tra an toàn
  const handleSelectConversation = async (conversationId, sellerId) => {
    if (!userId) return;

    // Luôn join conversation mới khi chọn
    joinConversation(conversationId, userId);

    setCurrentConversation(conversationId);
    setCurrentSellerId(sellerId);

    try {
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unread: false,
              unreadCount: 0,
            };
          }
          return conv;
        });
      });

      await apimarkMessagesAsRead(conversationId);

      if (sellerId) {
        autoMarkAsRead(conversationId, userId, sellerId);
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const toggleOptionsMenu = (conversationId) => {
    setExpandedOptions(
      expandedOptions === conversationId ? null : conversationId
    );
  };

  const handleMessageSent = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === currentConversation) {
          return {
            ...conv,
            sender: "me",
            lastMessage: newMessage.content || "[Hình ảnh]",
            time: formatTime(new Date()),
          };
        }
        return conv;
      });
    });
  };

  const isAnyoneTyping = () => {
    if (!currentConversation) return false;

    const activeContact = conversations.find(
      (c) => c.id === currentConversation
    );
    if (!activeContact?.sellerId) return false;

    return Boolean(typingUsers[activeContact.sellerId]);
  };

  return (
    <div className="w-full h-screen flex shadow-lg bg-white">
      <div className="w-72 flex-shrink-0 h-full">
        <ChatList   
          conversations={conversations}
          currentConversationId={currentConversation}
          loading={loading}
          onSelectConversation={handleSelectConversation}
          onToggleOptions={toggleOptionsMenu}
          expandedOptions={expandedOptions}
        />
      </div>
      <div className="flex-1 flex flex-col relative h-full">
        <ChatMessages
          messages={messages}
          currentConversationId={currentConversation}
          currentSellerId={currentSellerId}
          loading={loading}
          uploadLoading={uploadLoading}
          setUploadLoading={setUploadLoading}
          conversations={conversations}
          onMessageSent={handleMessageSent}
          setMessages={setMessages}
          expandedOptions={expandedOptions}
          onToggleOptions={toggleOptionsMenu}
          isTyping={isAnyoneTyping()}
          renderMessage={(msg) => {
            if (msg.type === "system") {
              return <SystemMessage displayText={msg.displayText} />;
            } else if (msg.type === "product-banner") {
              return <ProductBanner productRef={msg.productRef} />;
            }
            return null;
          }}
        />
      </div>

      {/* Error toast notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <div className="flex">
            <div className="py-1">
              <svg
                className="h-6 w-6 text-red-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold">Lỗi</p>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto pl-3">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
