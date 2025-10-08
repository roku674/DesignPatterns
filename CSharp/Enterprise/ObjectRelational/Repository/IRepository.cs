using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Enterprise.ObjectRelational.Repository;

/// <summary>
/// Repository pattern - Mediates between domain and data mapping layers.
/// Provides collection-like interface for accessing domain objects.
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public interface IRepository<T> where T : class
{
    /// <summary>
    /// Gets entity by ID.
    /// </summary>
    T GetById(int id);

    /// <summary>
    /// Gets all entities.
    /// </summary>
    IEnumerable<T> GetAll();

    /// <summary>
    /// Finds entities matching predicate.
    /// </summary>
    IEnumerable<T> Find(Expression<Func<T, bool>> predicate);

    /// <summary>
    /// Adds new entity.
    /// </summary>
    void Add(T entity);

    /// <summary>
    /// Updates existing entity.
    /// </summary>
    void Update(T entity);

    /// <summary>
    /// Removes entity.
    /// </summary>
    void Remove(T entity);

    /// <summary>
    /// Removes entity by ID.
    /// </summary>
    void RemoveById(int id);

    /// <summary>
    /// Checks if entity exists.
    /// </summary>
    bool Exists(int id);

    /// <summary>
    /// Counts entities matching predicate.
    /// </summary>
    int Count(Expression<Func<T, bool>> predicate = null);
}
