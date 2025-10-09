using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace Facade;

/// <summary>
/// Complex subsystem component - Validation logic.
/// </summary>
public class ValidationService
{
    public async Task<ValidationResult> ValidateUserAsync(User user)
    {
        await Task.Delay(10); // Simulate validation processing

        ValidationResult result = new ValidationResult();

        Console.WriteLine($"[ValidationService] Validating user: {user.Username}");

        // Username validation
        if (string.IsNullOrWhiteSpace(user.Username))
        {
            result.AddError("Username cannot be empty");
        }
        else if (user.Username.Length < 3)
        {
            result.AddError("Username must be at least 3 characters");
        }
        else if (user.Username.Length > 50)
        {
            result.AddError("Username cannot exceed 50 characters");
        }

        // Email validation
        if (string.IsNullOrWhiteSpace(user.Email))
        {
            result.AddError("Email cannot be empty");
        }
        else if (!IsValidEmail(user.Email))
        {
            result.AddError("Email format is invalid");
        }

        if (result.IsValid)
        {
            Console.WriteLine("[ValidationService] Validation PASSED");
        }
        else
        {
            Console.WriteLine($"[ValidationService] Validation FAILED: {string.Join(", ", result.Errors)}");
        }

        return result;
    }

    private bool IsValidEmail(string email)
    {
        Regex emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        return emailRegex.IsMatch(email);
    }
}

public class ValidationResult
{
    public List<string> Errors { get; } = new List<string>();
    public bool IsValid => Errors.Count == 0;

    public void AddError(string error)
    {
        Errors.Add(error);
    }
}
