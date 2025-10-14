using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DesignPatterns.DotNet.AspNetCore.MinimalAPI
{
    /// <summary>
    /// Minimal API Pattern - Lightweight API endpoint definitions
    ///
    /// This pattern demonstrates how to create minimal APIs in ASP.NET Core
    /// without controllers, using route handlers and endpoint definitions.
    /// Minimal APIs provide a simplified approach for building HTTP APIs.
    /// </summary>

    // Domain models
    public record Product(int Id, string Name, decimal Price, string Category);

    public record CreateProductRequest(string Name, decimal Price, string Category);

    public record UpdateProductRequest(string Name, decimal Price, string Category);

    public record ApiResponse<T>(bool Success, T Data, string Message = null, List<string> Errors = null);

    // Repository interface
    public interface IProductRepository
    {
        Task<List<Product>> GetAllAsync();
        Task<Product> GetByIdAsync(int id);
        Task<Product> CreateAsync(Product product);
        Task<Product> UpdateAsync(int id, Product product);
        Task<bool> DeleteAsync(int id);
        Task<List<Product>> SearchAsync(string term);
        Task<List<Product>> GetByCategoryAsync(string category);
    }

    // In-memory repository implementation
    public class InMemoryProductRepository : IProductRepository
    {
        private readonly List<Product> _products;
        private int _nextId;

        public InMemoryProductRepository()
        {
            _nextId = 1;
            _products = new List<Product>
            {
                new Product(_nextId++, "Laptop", 999.99m, "Electronics"),
                new Product(_nextId++, "Mouse", 29.99m, "Electronics"),
                new Product(_nextId++, "Desk", 199.99m, "Furniture"),
                new Product(_nextId++, "Chair", 149.99m, "Furniture")
            };
        }

        public Task<List<Product>> GetAllAsync()
        {
            return Task.FromResult(_products.ToList());
        }

        public Task<Product> GetByIdAsync(int id)
        {
            Product product = _products.FirstOrDefault(p => p.Id == id);
            return Task.FromResult(product);
        }

        public Task<Product> CreateAsync(Product product)
        {
            Product newProduct = product with { Id = _nextId++ };
            _products.Add(newProduct);
            return Task.FromResult(newProduct);
        }

        public Task<Product> UpdateAsync(int id, Product product)
        {
            int index = _products.FindIndex(p => p.Id == id);
            if (index == -1)
            {
                return Task.FromResult<Product>(null);
            }

            Product updated = product with { Id = id };
            _products[index] = updated;
            return Task.FromResult(updated);
        }

        public Task<bool> DeleteAsync(int id)
        {
            int removed = _products.RemoveAll(p => p.Id == id);
            return Task.FromResult(removed > 0);
        }

        public Task<List<Product>> SearchAsync(string term)
        {
            List<Product> results = _products
                .Where(p => p.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
                .ToList();
            return Task.FromResult(results);
        }

        public Task<List<Product>> GetByCategoryAsync(string category)
        {
            List<Product> results = _products
                .Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
                .ToList();
            return Task.FromResult(results);
        }
    }

    // Validation service
    public interface IProductValidator
    {
        List<string> Validate(CreateProductRequest request);
        List<string> Validate(UpdateProductRequest request);
    }

    public class ProductValidator : IProductValidator
    {
        public List<string> Validate(CreateProductRequest request)
        {
            List<string> errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Name))
                errors.Add("Name is required");

            if (request.Name?.Length > 100)
                errors.Add("Name must be 100 characters or less");

            if (request.Price <= 0)
                errors.Add("Price must be greater than zero");

            if (string.IsNullOrWhiteSpace(request.Category))
                errors.Add("Category is required");

            return errors;
        }

        public List<string> Validate(UpdateProductRequest request)
        {
            List<string> errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Name))
                errors.Add("Name is required");

            if (request.Name?.Length > 100)
                errors.Add("Name must be 100 characters or less");

            if (request.Price <= 0)
                errors.Add("Price must be greater than zero");

            if (string.IsNullOrWhiteSpace(request.Category))
                errors.Add("Category is required");

            return errors;
        }
    }

    // Minimal API endpoint definitions
    public static class ProductEndpoints
    {
        public static void MapProductEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("/api/products")
                .WithTags("Products")
                .WithOpenApi();

            // GET /api/products
            group.MapGet("/", GetAllProducts)
                .WithName("GetAllProducts")
                .Produces<ApiResponse<List<Product>>>(StatusCodes.Status200OK);

            // GET /api/products/{id}
            group.MapGet("/{id:int}", GetProductById)
                .WithName("GetProductById")
                .Produces<ApiResponse<Product>>(StatusCodes.Status200OK)
                .Produces<ApiResponse<Product>>(StatusCodes.Status404NotFound);

            // POST /api/products
            group.MapPost("/", CreateProduct)
                .WithName("CreateProduct")
                .Produces<ApiResponse<Product>>(StatusCodes.Status201Created)
                .Produces<ApiResponse<Product>>(StatusCodes.Status400BadRequest);

            // PUT /api/products/{id}
            group.MapPut("/{id:int}", UpdateProduct)
                .WithName("UpdateProduct")
                .Produces<ApiResponse<Product>>(StatusCodes.Status200OK)
                .Produces<ApiResponse<Product>>(StatusCodes.Status404NotFound)
                .Produces<ApiResponse<Product>>(StatusCodes.Status400BadRequest);

            // DELETE /api/products/{id}
            group.MapDelete("/{id:int}", DeleteProduct)
                .WithName("DeleteProduct")
                .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
                .Produces<ApiResponse<bool>>(StatusCodes.Status404NotFound);

            // GET /api/products/search?term={term}
            group.MapGet("/search", SearchProducts)
                .WithName("SearchProducts")
                .Produces<ApiResponse<List<Product>>>(StatusCodes.Status200OK);

            // GET /api/products/category/{category}
            group.MapGet("/category/{category}", GetProductsByCategory)
                .WithName("GetProductsByCategory")
                .Produces<ApiResponse<List<Product>>>(StatusCodes.Status200OK);
        }

        private static async Task<IResult> GetAllProducts(
            IProductRepository repository,
            ILogger<Program> logger)
        {
            logger.LogInformation("Getting all products");

            List<Product> products = await repository.GetAllAsync();

            ApiResponse<List<Product>> response = new ApiResponse<List<Product>>(
                Success: true,
                Data: products,
                Message: $"Retrieved {products.Count} products"
            );

            return Results.Ok(response);
        }

        private static async Task<IResult> GetProductById(
            int id,
            IProductRepository repository,
            ILogger<Program> logger)
        {
            logger.LogInformation("Getting product with ID: {ProductId}", id);

            Product product = await repository.GetByIdAsync(id);

            if (product == null)
            {
                ApiResponse<Product> notFoundResponse = new ApiResponse<Product>(
                    Success: false,
                    Data: null,
                    Message: $"Product with ID {id} not found"
                );
                return Results.NotFound(notFoundResponse);
            }

            ApiResponse<Product> response = new ApiResponse<Product>(
                Success: true,
                Data: product,
                Message: "Product retrieved successfully"
            );

            return Results.Ok(response);
        }

        private static async Task<IResult> CreateProduct(
            CreateProductRequest request,
            IProductRepository repository,
            IProductValidator validator,
            ILogger<Program> logger)
        {
            logger.LogInformation("Creating new product: {ProductName}", request.Name);

            List<string> errors = validator.Validate(request);
            if (errors.Any())
            {
                ApiResponse<Product> errorResponse = new ApiResponse<Product>(
                    Success: false,
                    Data: null,
                    Message: "Validation failed",
                    Errors: errors
                );
                return Results.BadRequest(errorResponse);
            }

            Product product = new Product(0, request.Name, request.Price, request.Category);
            Product created = await repository.CreateAsync(product);

            ApiResponse<Product> response = new ApiResponse<Product>(
                Success: true,
                Data: created,
                Message: "Product created successfully"
            );

            return Results.Created($"/api/products/{created.Id}", response);
        }

        private static async Task<IResult> UpdateProduct(
            int id,
            UpdateProductRequest request,
            IProductRepository repository,
            IProductValidator validator,
            ILogger<Program> logger)
        {
            logger.LogInformation("Updating product with ID: {ProductId}", id);

            List<string> errors = validator.Validate(request);
            if (errors.Any())
            {
                ApiResponse<Product> errorResponse = new ApiResponse<Product>(
                    Success: false,
                    Data: null,
                    Message: "Validation failed",
                    Errors: errors
                );
                return Results.BadRequest(errorResponse);
            }

            Product product = new Product(id, request.Name, request.Price, request.Category);
            Product updated = await repository.UpdateAsync(id, product);

            if (updated == null)
            {
                ApiResponse<Product> notFoundResponse = new ApiResponse<Product>(
                    Success: false,
                    Data: null,
                    Message: $"Product with ID {id} not found"
                );
                return Results.NotFound(notFoundResponse);
            }

            ApiResponse<Product> response = new ApiResponse<Product>(
                Success: true,
                Data: updated,
                Message: "Product updated successfully"
            );

            return Results.Ok(response);
        }

        private static async Task<IResult> DeleteProduct(
            int id,
            IProductRepository repository,
            ILogger<Program> logger)
        {
            logger.LogInformation("Deleting product with ID: {ProductId}", id);

            bool deleted = await repository.DeleteAsync(id);

            if (!deleted)
            {
                ApiResponse<bool> notFoundResponse = new ApiResponse<bool>(
                    Success: false,
                    Data: false,
                    Message: $"Product with ID {id} not found"
                );
                return Results.NotFound(notFoundResponse);
            }

            ApiResponse<bool> response = new ApiResponse<bool>(
                Success: true,
                Data: true,
                Message: "Product deleted successfully"
            );

            return Results.Ok(response);
        }

        private static async Task<IResult> SearchProducts(
            string term,
            IProductRepository repository,
            ILogger<Program> logger)
        {
            logger.LogInformation("Searching products with term: {SearchTerm}", term);

            if (string.IsNullOrWhiteSpace(term))
            {
                ApiResponse<List<Product>> errorResponse = new ApiResponse<List<Product>>(
                    Success: false,
                    Data: null,
                    Message: "Search term is required",
                    Errors: new List<string> { "term parameter cannot be empty" }
                );
                return Results.BadRequest(errorResponse);
            }

            List<Product> products = await repository.SearchAsync(term);

            ApiResponse<List<Product>> response = new ApiResponse<List<Product>>(
                Success: true,
                Data: products,
                Message: $"Found {products.Count} products matching '{term}'"
            );

            return Results.Ok(response);
        }

        private static async Task<IResult> GetProductsByCategory(
            string category,
            IProductRepository repository,
            ILogger<Program> logger)
        {
            logger.LogInformation("Getting products by category: {Category}", category);

            List<Product> products = await repository.GetByCategoryAsync(category);

            ApiResponse<List<Product>> response = new ApiResponse<List<Product>>(
                Success: true,
                Data: products,
                Message: $"Found {products.Count} products in category '{category}'"
            );

            return Results.Ok(response);
        }
    }

    // Health check endpoints
    public static class HealthCheckEndpoints
    {
        public static void MapHealthCheckEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapGet("/health", () => Results.Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow
            }))
            .WithName("HealthCheck")
            .WithTags("Health");

            app.MapGet("/health/ready", () => Results.Ok(new
            {
                status = "Ready",
                timestamp = DateTime.UtcNow
            }))
            .WithName("ReadinessCheck")
            .WithTags("Health");
        }
    }

    // Minimal API builder extensions
    public static class MinimalApiBuilder
    {
        public static WebApplication BuildMinimalApi(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            // Add services
            builder.Services.AddSingleton<IProductRepository, InMemoryProductRepository>();
            builder.Services.AddSingleton<IProductValidator, ProductValidator>();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddLogging();

            WebApplication app = builder.Build();

            // Configure middleware
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Map endpoints
            app.MapProductEndpoints();
            app.MapHealthCheckEndpoints();

            // Root endpoint
            app.MapGet("/", () => Results.Ok(new
            {
                name = "Products API",
                version = "1.0",
                endpoints = new[]
                {
                    "/api/products",
                    "/api/products/{id}",
                    "/api/products/search?term={term}",
                    "/api/products/category/{category}",
                    "/health",
                    "/health/ready"
                }
            }))
            .WithName("ApiInfo")
            .WithTags("Info");

            return app;
        }
    }

    // Demonstration
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Minimal API Pattern Demo ===\n");

            // Demo 1: In-memory simulation of minimal API
            Console.WriteLine("Demo 1: Simulating Minimal API Endpoints");
            await DemoMinimalApiEndpoints();

            // Demo 2: Repository pattern with minimal API
            Console.WriteLine("\nDemo 2: Repository Pattern Integration");
            await DemoRepositoryIntegration();

            // Demo 3: Validation in minimal API
            Console.WriteLine("\nDemo 3: Request Validation");
            await DemoValidation();

            // Demo 4: Search and filtering
            Console.WriteLine("\nDemo 4: Search and Filtering");
            await DemoSearchAndFiltering();

            // Demo 5: Error handling
            Console.WriteLine("\nDemo 5: Error Handling");
            await DemoErrorHandling();

            Console.WriteLine("\n=== Minimal API Benefits ===");
            Console.WriteLine("- Reduced boilerplate code");
            Console.WriteLine("- Faster startup time");
            Console.WriteLine("- Lower memory footprint");
            Console.WriteLine("- Simpler routing");
            Console.WriteLine("- Built-in dependency injection");
            Console.WriteLine("- Type-safe route parameters");
            Console.WriteLine("- Better performance than controllers");
        }

        private static async Task DemoMinimalApiEndpoints()
        {
            IProductRepository repository = new InMemoryProductRepository();
            ILogger<Program> logger = LoggerFactory.Create(b => b.AddConsole())
                .CreateLogger<Program>();

            // Simulate GET all products
            List<Product> products = await repository.GetAllAsync();
            Console.WriteLine($"  GET /api/products: Retrieved {products.Count} products");

            // Simulate GET by ID
            Product product = await repository.GetByIdAsync(1);
            Console.WriteLine($"  GET /api/products/1: {product?.Name}");
        }

        private static async Task DemoRepositoryIntegration()
        {
            IProductRepository repository = new InMemoryProductRepository();

            // Create new product
            Product newProduct = new Product(0, "Keyboard", 79.99m, "Electronics");
            Product created = await repository.CreateAsync(newProduct);
            Console.WriteLine($"  Created product: {created.Name} (ID: {created.Id})");

            // Update product
            Product updated = new Product(created.Id, "Mechanical Keyboard", 99.99m, "Electronics");
            Product result = await repository.UpdateAsync(created.Id, updated);
            Console.WriteLine($"  Updated product: {result.Name} - ${result.Price}");

            // Delete product
            bool deleted = await repository.DeleteAsync(created.Id);
            Console.WriteLine($"  Deleted product: {deleted}");
        }

        private static async Task DemoValidation()
        {
            IProductValidator validator = new ProductValidator();

            // Valid request
            CreateProductRequest validRequest = new CreateProductRequest(
                Name: "Monitor",
                Price: 299.99m,
                Category: "Electronics"
            );

            List<string> errors = validator.Validate(validRequest);
            Console.WriteLine($"  Valid request: {errors.Count} errors");

            // Invalid request
            CreateProductRequest invalidRequest = new CreateProductRequest(
                Name: "",
                Price: -10m,
                Category: null
            );

            errors = validator.Validate(invalidRequest);
            Console.WriteLine($"  Invalid request: {errors.Count} errors");
            foreach (string error in errors)
            {
                Console.WriteLine($"    - {error}");
            }

            await Task.CompletedTask;
        }

        private static async Task DemoSearchAndFiltering()
        {
            IProductRepository repository = new InMemoryProductRepository();

            // Search products
            List<Product> searchResults = await repository.SearchAsync("Laptop");
            Console.WriteLine($"  Search 'Laptop': {searchResults.Count} results");

            // Filter by category
            List<Product> electronics = await repository.GetByCategoryAsync("Electronics");
            Console.WriteLine($"  Category 'Electronics': {electronics.Count} products");

            List<Product> furniture = await repository.GetByCategoryAsync("Furniture");
            Console.WriteLine($"  Category 'Furniture': {furniture.Count} products");
        }

        private static async Task DemoErrorHandling()
        {
            IProductRepository repository = new InMemoryProductRepository();

            // Try to get non-existent product
            Product product = await repository.GetByIdAsync(999);
            if (product == null)
            {
                Console.WriteLine("  Product not found - returns 404");
            }

            // Try to delete non-existent product
            bool deleted = await repository.DeleteAsync(999);
            if (!deleted)
            {
                Console.WriteLine("  Delete failed - returns 404");
            }

            // Validation error
            IProductValidator validator = new ProductValidator();
            CreateProductRequest request = new CreateProductRequest("", -1, null);
            List<string> errors = validator.Validate(request);
            if (errors.Any())
            {
                Console.WriteLine("  Validation failed - returns 400");
            }
        }
    }
}
