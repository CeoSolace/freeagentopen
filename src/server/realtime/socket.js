/*
 * Socket.IO integration
 *
 * Attaches Socket.IO to an existing HTTP server and manages realtime
 * messaging for conversations.
 */

const { Server } = require("socket.io");
const chatService = require("../chat/chatService");

let logger;
try {
  logger = require("../common/logger");
} catch (err) {
  logger = {
    info: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
}

const activeConversations = {};
const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Initialise the Socket.IO server.
 *
 * @param {http.Server} server
 */
function initSocket(server) {
  const io = new Server(server, {
    path: "/socket.io",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("join", async (payload) => {
      try {
        const { conversationId, userId } = payload || {};
        if (!conversationId || !userId) return;

        socket.conversationId = conversationId;
        socket.userId = userId;

        socket.join(conversationId);

        if (activeConversations[conversationId]?.timer) {
          clearTimeout(activeConversations[conversationId].timer);
          activeConversations[conversationId].timer = null;
        }

        if (!activeConversations[conversationId]) {
          activeConversations[conversationId] = { participants: new Set(), timer: null };
        }

        activeConversations[conversationId].participants.add(String(userId));

        await chatService.joinConversation(conversationId, userId);

        const messages = await chatService.getMessages(conversationId);
        socket.emit("history", messages);
      } catch (err) {
        logger.error("Error handling join", err);
      }
    });

    socket.on("message", async (payload) => {
      try {
        const { conversationId, userId, content } = payload || {};
        if (!conversationId || !userId || !content) return;

        const msg = await chatService.addMessage(conversationId, userId, content);
        io.to(conversationId).emit("message", msg);
      } catch (err) {
        logger.error("Error handling message", err);
      }
    });

    socket.on("leave", async (payload) => {
      const conversationId = payload?.conversationId || socket.conversationId;
      const userId = payload?.userId || socket.userId;
      await handleDeparture(conversationId, userId);
    });

    socket.on("disconnect", async () => {
      await handleDeparture(socket.conversationId, socket.userId);
    });

    async function handleDeparture(conversationId, userId) {
      try {
        if (!conversationId || !userId) return;

        const record = activeConversations[conversationId];
        if (record?.participants) {
          record.participants.delete(String(userId));

          if (record.participants.size === 0 && !record.timer) {
            record.timer = setTimeout(async () => {
              try {
                await chatService.deleteConversation(conversationId);
                delete activeConversations[conversationId];
              } catch (e) {
                logger.error("Failed to delete conversation after grace period", e);
              }
            }, GRACE_PERIOD_MS);
          }
        }

        await chatService.leaveConversation(conversationId, userId);
      } catch (err) {
        logger.error("Error handling departure", err);
      }
    }
  });

  return io;
}

module.exports = { initSocket };
