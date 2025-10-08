class Repository {
  constructor(dataMapper) {
    this.dataMapper = dataMapper;
    this.identityMap = new Map();
  }
  async findById(id) {
    if (this.identityMap.has(id)) {
      return this.identityMap.get(id);
    }
    const entity = await this.dataMapper.findById(id);
    if (entity) {
      this.identityMap.set(id, entity);
    }
    return entity;
  }
  async findAll() {
    return await this.dataMapper.findAll();
  }
  async save(entity) {
    await this.dataMapper.save(entity);
    this.identityMap.set(entity.id, entity);
  }
  async delete(entity) {
    await this.dataMapper.delete(entity.id);
    this.identityMap.delete(entity.id);
  }
  clear() {
    this.identityMap.clear();
  }
}
class UserRepository extends Repository {
  async findByEmail(email) {
    return await this.dataMapper.findByEmail(email);
  }
  async findActive() {
    return await this.dataMapper.findWhere({ active: true });
  }
}
module.exports = { Repository, UserRepository };