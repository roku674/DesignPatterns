/**
 * Serialization Pattern
 */

class Serializer {
  serialize(obj) {
    throw new Error('Must implement serialize');
  }

  deserialize(data) {
    throw new Error('Must implement deserialize');
  }
}

class JSONSerializer extends Serializer {
  serialize(obj) {
    return JSON.stringify(obj);
  }

  deserialize(data) {
    return JSON.parse(data);
  }
}

class XMLSerializer extends Serializer {
  serialize(obj) {
    return `<object>${this.toXML(obj)}</object>`;
  }

  toXML(obj) {
    return Object.entries(obj)
      .map(([key, value]) => `<${key}>${value}</${key}>`)
      .join('');
  }

  deserialize(data) {
    const obj = {};
    const matches = data.matchAll(/<(\w+)>(.*?)<\/\1>/g);
    for (const match of matches) {
      obj[match[1]] = match[2];
    }
    return obj;
  }
}

class SerializableUser {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  serialize(serializer) {
    return serializer.serialize(this);
  }

  static deserialize(data, serializer) {
    const obj = serializer.deserialize(data);
    return new SerializableUser(obj.id, obj.name, obj.email);
  }
}

module.exports = {
  JSONSerializer,
  XMLSerializer,
  SerializableUser
};
