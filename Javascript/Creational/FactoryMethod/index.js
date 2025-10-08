/**
 * Factory Method Pattern - Demo
 * Demonstrates the Factory Method pattern with a logistics system
 */

const {
  RoadLogistics,
  SeaLogistics,
  AirLogistics
} = require('./logistics');

console.log('=== Factory Method Pattern Demo ===\n');

// Client code works with creators through the base interface
function clientCode(logistics, origin, destination) {
  console.log(`Using ${logistics.constructor.name}:`);
  console.log(logistics.planDelivery(origin, destination));
  console.log();
}

// Use road logistics
const roadLogistics = new RoadLogistics();
clientCode(roadLogistics, 'New York', 'Boston');

// Use sea logistics
const seaLogistics = new SeaLogistics();
clientCode(seaLogistics, 'Los Angeles', 'Tokyo');

// Use air logistics
const airLogistics = new AirLogistics();
clientCode(airLogistics, 'London', 'Dubai');

// Demonstrate runtime selection
console.log('=== Runtime Selection Example ===\n');

function getLogistics(type) {
  switch (type) {
    case 'road':
      return new RoadLogistics();
    case 'sea':
      return new SeaLogistics();
    case 'air':
      return new AirLogistics();
    default:
      throw new Error(`Unknown logistics type: ${type}`);
  }
}

const deliveryTypes = ['road', 'sea', 'air'];
deliveryTypes.forEach(type => {
  const logistics = getLogistics(type);
  console.log(logistics.planDelivery('Warehouse', 'Customer'));
});
