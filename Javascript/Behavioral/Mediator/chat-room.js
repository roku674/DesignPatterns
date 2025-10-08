/**
 * Mediator Pattern - Chat Room
 */

class ChatMediator {
  sendMessage(message, from, to = null) {
    throw new Error('sendMessage() must be implemented');
  }
}

class ChatRoom extends ChatMediator {
  constructor() {
    super();
    this.users = new Map();
  }

  addUser(user) {
    this.users.set(user.name, user);
    user.setChatRoom(this);
  }

  sendMessage(message, from, to = null) {
    if (to) {
      const recipient = this.users.get(to);
      if (recipient) {
        recipient.receive(message, from);
      }
    } else {
      this.users.forEach(user => {
        if (user.name !== from) {
          user.receive(message, from);
        }
      });
    }
  }
}

class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }

  setChatRoom(chatRoom) {
    this.chatRoom = chatRoom;
  }

  send(message, to = null) {
    console.log(`[${this.name}] Sending: "${message}"${to ? ` to ${to}` : ' (broadcast)'}`);
    this.chatRoom.sendMessage(message, this.name, to);
  }

  receive(message, from) {
    console.log(`  [${this.name}] Received from ${from}: "${message}"`);
  }
}

module.exports = { ChatRoom, User };
