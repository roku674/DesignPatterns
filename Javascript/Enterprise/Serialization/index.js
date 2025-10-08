const { JSONSerializer, XMLSerializer, SerializableUser } = require('./Serialization');

console.log('=== Serialization Pattern Demo ===\n');

const user = new SerializableUser(1, 'John Doe', 'john@example.com');

console.log('1. JSON Serialization');
const jsonSerializer = new JSONSerializer();
const jsonData = user.serialize(jsonSerializer);
console.log(`   Serialized: ${jsonData}`);
const jsonUser = SerializableUser.deserialize(jsonData, jsonSerializer);
console.log(`   Deserialized: ${jsonUser.name}`);

console.log('\n2. XML Serialization');
const xmlSerializer = new XMLSerializer();
const xmlData = user.serialize(xmlSerializer);
console.log(`   Serialized: ${xmlData}`);
const xmlUser = SerializableUser.deserialize(xmlData, xmlSerializer);
console.log(`   Deserialized: ${xmlUser.name}`);

console.log('\n=== Benefits ===');
console.log('✓ Format-agnostic serialization');
console.log('✓ Easy to swap serializers');
console.log('✓ Supports multiple formats');
