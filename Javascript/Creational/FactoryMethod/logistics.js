/**
 * Factory Method Pattern - Logistics System Example
 *
 * The Factory Method pattern provides an interface for creating objects,
 * but lets subclasses decide which class to instantiate.
 */

/**
 * Abstract Transport interface
 * Defines the interface for delivery vehicles
 */
class Transport {
  deliver() {
    throw new Error('Method deliver() must be implemented');
  }

  getType() {
    throw new Error('Method getType() must be implemented');
  }
}

/**
 * Concrete Product: Truck
 */
class Truck extends Transport {
  deliver() {
    return 'Delivering by land in a truck';
  }

  getType() {
    return 'Truck';
  }
}

/**
 * Concrete Product: Ship
 */
class Ship extends Transport {
  deliver() {
    return 'Delivering by sea in a ship';
  }

  getType() {
    return 'Ship';
  }
}

/**
 * Concrete Product: Plane
 */
class Plane extends Transport {
  deliver() {
    return 'Delivering by air in a plane';
  }

  getType() {
    return 'Plane';
  }
}

/**
 * Abstract Creator: Logistics
 * Declares the factory method that returns Transport objects
 */
class Logistics {
  /**
   * Factory method - to be overridden by subclasses
   * @returns {Transport}
   */
  createTransport() {
    throw new Error('Method createTransport() must be implemented');
  }

  /**
   * Core business logic that uses the factory method
   * @param {string} origin
   * @param {string} destination
   * @returns {string}
   */
  planDelivery(origin, destination) {
    const transport = this.createTransport();
    return `Planning delivery from ${origin} to ${destination}: ${transport.deliver()}`;
  }
}

/**
 * Concrete Creator: RoadLogistics
 */
class RoadLogistics extends Logistics {
  createTransport() {
    return new Truck();
  }
}

/**
 * Concrete Creator: SeaLogistics
 */
class SeaLogistics extends Logistics {
  createTransport() {
    return new Ship();
  }
}

/**
 * Concrete Creator: AirLogistics
 */
class AirLogistics extends Logistics {
  createTransport() {
    return new Plane();
  }
}

module.exports = {
  Logistics,
  RoadLogistics,
  SeaLogistics,
  AirLogistics,
  Transport,
  Truck,
  Ship,
  Plane
};
