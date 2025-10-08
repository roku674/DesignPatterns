/**
 * Data Transfer Object (DTO) Pattern
 * 
 * An object that carries data between processes to reduce method calls.
 */

/**
 * User DTO
 */
class UserDTO {
  constructor(id, username, email, firstName, lastName) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  /**
   * Get full name
   * @returns {string} Full name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Convert to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    };
  }
}

/**
 * Order DTO
 */
class OrderDTO {
  constructor(orderId, customerId, items, totalAmount, orderDate) {
    this.orderId = orderId;
    this.customerId = customerId;
    this.items = items;
    this.totalAmount = totalAmount;
    this.orderDate = orderDate;
  }

  /**
   * Get item count
   * @returns {number} Total items
   */
  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Convert to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      orderId: this.orderId,
      customerId: this.customerId,
      items: this.items,
      totalAmount: this.totalAmount,
      orderDate: this.orderDate
    };
  }
}

/**
 * DTO Assembler - Converts domain objects to DTOs
 */
class DTOAssembler {
  /**
   * Create UserDTO from domain object
   * @param {Object} user - Domain user object
   * @returns {UserDTO} User DTO
   */
  static createUserDTO(user) {
    return new UserDTO(
      user.id,
      user.username,
      user.email,
      user.profile.firstName,
      user.profile.lastName
    );
  }

  /**
   * Create OrderDTO from domain object
   * @param {Object} order - Domain order object
   * @returns {OrderDTO} Order DTO
   */
  static createOrderDTO(order) {
    return new OrderDTO(
      order.id,
      order.customer.id,
      order.lineItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price
      })),
      order.calculateTotal(),
      order.createdAt
    );
  }
}

module.exports = {
  UserDTO,
  OrderDTO,
  DTOAssembler
};
