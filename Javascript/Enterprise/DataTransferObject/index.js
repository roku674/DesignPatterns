const { UserDTO, OrderDTO, DTOAssembler } = require('./DataTransferObject');

console.log('=== Data Transfer Object Pattern Demo ===\n');

console.log('1. Creating UserDTO directly');
const userDTO = new UserDTO('1', 'johndoe', 'john@example.com', 'John', 'Doe');
console.log('   User:', userDTO.getFullName());
console.log('   JSON:', JSON.stringify(userDTO.toJSON(), null, 2));

console.log('\n2. Creating OrderDTO');
const orderDTO = new OrderDTO(
  'ORD-001',
  'CUST-123',
  [
    { productId: 'P1', productName: 'Laptop', quantity: 1, price: 999.99 },
    { productId: 'P2', productName: 'Mouse', quantity: 2, price: 29.99 }
  ],
  1059.97,
  new Date()
);
console.log('   Order ID:', orderDTO.orderId);
console.log('   Total items:', orderDTO.getItemCount());
console.log('   Total amount: $' + orderDTO.totalAmount);

console.log('\n3. Using DTOAssembler');
const domainUser = {
  id: '2',
  username: 'janesmith',
  email: 'jane@example.com',
  profile: { firstName: 'Jane', lastName: 'Smith' }
};
const assembledUserDTO = DTOAssembler.createUserDTO(domainUser);
console.log('   Assembled user:', assembledUserDTO.getFullName());

console.log('\n=== Benefits ===');
console.log('✓ Reduces number of remote calls');
console.log('✓ Encapsulates serialization logic');
console.log('✓ Provides data structure for network transfer');
console.log('✓ Decouples domain model from presentation');
