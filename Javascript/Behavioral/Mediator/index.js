const { ChatRoom, User } = require('./chat-room');

console.log('=== Mediator Pattern Demo ===\n');

const chatRoom = new ChatRoom();

const alice = new User('Alice');
const bob = new User('Bob');
const charlie = new User('Charlie');

chatRoom.addUser(alice);
chatRoom.addUser(bob);
chatRoom.addUser(charlie);

console.log('Alice broadcasts message:');
alice.send('Hello everyone!');

console.log('\nBob sends private message to Alice:');
bob.send('Hi Alice, how are you?', 'Alice');

console.log('\nCharlie broadcasts:');
charlie.send('Anyone want to grab lunch?');

console.log('\n=== Demo Complete ===');
