using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Enterprise.ObjectRelational.Repository;

/// <summary>
/// In-memory repository implementation for demonstration.
/// In production, this would use Entity Framework or another ORM.
/// </summary>
public class InMemoryRepository<T> : IRepository<T> where T : class, IEntity
{
    private readonly List<T> _entities;
    private int _nextId;

    public InMemoryRepository()
    {
        _entities = new List<T>();
        _nextId = 1;
    }

    public T GetById(int id)
    {
        return _entities.FirstOrDefault(e => e.Id == id);
    }

    public IEnumerable<T> GetAll()
    {
        return _entities.ToList();
    }

    public IEnumerable<T> Find(Expression<Func<T, bool>> predicate)
    {
        Func<T, bool> compiledPredicate = predicate.Compile();
        return _entities.Where(compiledPredicate).ToList();
    }

    public void Add(T entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        if (entity.Id == 0)
        {
            entity.Id = _nextId++;
        }

        _entities.Add(entity);
    }

    public void Update(T entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        T existing = GetById(entity.Id);
        if (existing == null)
            throw new InvalidOperationException($"Entity with ID {entity.Id} not found");

        int index = _entities.IndexOf(existing);
        _entities[index] = entity;
    }

    public void Remove(T entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        _entities.Remove(entity);
    }

    public void RemoveById(int id)
    {
        T entity = GetById(id);
        if (entity != null)
        {
            _entities.Remove(entity);
        }
    }

    public bool Exists(int id)
    {
        return _entities.Any(e => e.Id == id);
    }

    public int Count(Expression<Func<T, bool>> predicate = null)
    {
        if (predicate == null)
            return _entities.Count;

        Func<T, bool> compiledPredicate = predicate.Compile();
        return _entities.Count(compiledPredicate);
    }
}

/// <summary>
/// Base interface for entities with ID.
/// </summary>
public interface IEntity
{
    int Id { get; set; }
}
