const Message = require('../models/Message');
const ArchivedMessage = require('../models/ArchivedMessage');

async function archiveOldMessages(conversationId, beforeDate) {
  const oldMessages = await Message.find({
    conversationId,
    createdAt: { $lt: beforeDate }
  });

  if (oldMessages.length) {
    const archived = oldMessages.map(msg => ({
      originalId: msg._id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      imagesUrl: msg.imagesUrl,
      status: msg.status,
      productRef: msg.productRef,
      archivedAt: new Date(),
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));
    await ArchivedMessage.insertMany(archived);
    await Message.deleteMany({ _id: { $in: oldMessages.map(m => m._id) } });
  }
}
module.exports = archiveOldMessages; 