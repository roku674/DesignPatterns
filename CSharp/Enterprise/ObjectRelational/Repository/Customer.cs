using System;

namespace Enterprise.ObjectRelational.Repository;

/// <summary>
/// Example domain entity.
/// </summary>
public class Customer : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public DateTime CreatedDate { get; set; }
    public bool IsActive { get; set; }

    public Customer(string name, string email)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        CreatedDate = DateTime.Now;
        IsActive = true;
    }

    public override string ToString()
    {
        return $"Customer[{Id}]: {Name} ({Email}) - Active: {IsActive}";
    }
}
