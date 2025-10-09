/**
 * Mediator Pattern - Real Chat Room with Message Routing
 *
 * Production-ready chat room with user management, private messages,
 * message history, and typing indicators.
 */

class ChatMediator {
  constructor() {
    this.users = new Map();
    this.messageHistory = [];
    this.typingUsers = new Set();
  }

  addUser(user) {
    if (this.users.has(user.id)) {
      throw new Error(`User ${user.id} already exists`);
    }
    this.users.set(user.id, user);
    user.setMediator(this);
    this.broadcastSystemMessage(`${user.name} joined the chat`);
    return user;
  }

  removeUser(userId) {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.typingUsers.delete(userId);
      this.broadcastSystemMessage(`${user.name} left the chat`);
    }
  }

  sendMessage(fromUserId, message, toUserId = null) {
    const sender = this.users.get(fromUserId);
    if (!sender) {
      throw new Error('Sender not found');
    }

    const messageData = {
      id: this.messageHistory.length + 1,
      from: sender.name,
      fromId: fromUserId,
      message,
      timestamp: new Date(),
      private: !!toUserId
    };

    this.messageHistory.push(messageData);

    if (toUserId) {
      const recipient = this.users.get(toUserId);
      if (!recipient) {
        throw new Error('Recipient not found');
      }
      recipient.receivePrivateMessage(messageData);
      sender.receivePrivateMessage({ ...messageData, from: 'You (to ' + recipient.name + ')' });
    } else {
      this.users.forEach(user => {
        if (user.id !== fromUserId) {
          user.receiveMessage(messageData);
        }
      });
    }

    return messageData;
  }

  broadcastSystemMessage(message) {
    const messageData = {
      id: this.messageHistory.length + 1,
      from: 'System',
      message,
      timestamp: new Date(),
      system: true
    };

    this.messageHistory.push(messageData);
    this.users.forEach(user => user.receiveSystemMessage(messageData));
  }

  setTyping(userId, isTyping) {
    if (isTyping) {
      this.typingUsers.add(userId);
    } else {
      this.typingUsers.delete(userId);
    }

    const user = this.users.get(userId);
    if (user) {
      this.users.forEach(u => {
        if (u.id !== userId) {
          u.onTypingStatus(user.name, isTyping);
        }
      });
    }
  }

  getOnlineUsers() {
    return Array.from(this.users.values()).map(u => ({
      id: u.id,
      name: u.name
    }));
  }

  getHistory(limit = 50) {
    return this.messageHistory.slice(-limit);
  }
}

class ChatUser {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.mediator = null;
    this.messages = [];
    this.typing = false;
  }

  setMediator(mediator) {
    this.mediator = mediator;
  }

  sendMessage(message) {
    if (!this.mediator) {
      throw new Error('User not connected to chat');
    }
    return this.mediator.sendMessage(this.id, message);
  }

  sendPrivateMessage(toUserId, message) {
    if (!this.mediator) {
      throw new Error('User not connected to chat');
    }
    return this.mediator.sendMessage(this.id, message, toUserId);
  }

  receiveMessage(messageData) {
    this.messages.push(messageData);
  }

  receivePrivateMessage(messageData) {
    this.messages.push({ ...messageData, private: true });
  }

  receiveSystemMessage(messageData) {
    this.messages.push(messageData);
  }

  startTyping() {
    if (!this.typing && this.mediator) {
      this.typing = true;
      this.mediator.setTyping(this.id, true);
    }
  }

  stopTyping() {
    if (this.typing && this.mediator) {
      this.typing = false;
      this.mediator.setTyping(this.id, false);
    }
  }

  onTypingStatus(userName, isTyping) {
    // Override in subclass or set callback
  }

  getMessages(limit = 20) {
    return this.messages.slice(-limit);
  }
}

module.exports = { ChatMediator, ChatUser };
