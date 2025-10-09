using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.Interpreter
{
    // Real Interpreter pattern implementation
    // Use case: Mathematical expression parser and evaluator with variables

    // Context holds variables and their values
    public class Context
    {
        private readonly Dictionary<string, double> _variables;

        public Context()
        {
            _variables = new Dictionary<string, double>();
        }

        public void SetVariable(string name, double value)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Variable name cannot be empty", nameof(name));
            }
            _variables[name] = value;
        }

        public double GetVariable(string name)
        {
            if (_variables.ContainsKey(name))
            {
                return _variables[name];
            }
            throw new InvalidOperationException($"Variable '{name}' is not defined");
        }

        public bool HasVariable(string name)
        {
            return _variables.ContainsKey(name);
        }

        public Dictionary<string, double> GetAllVariables()
        {
            return new Dictionary<string, double>(_variables);
        }
    }

    // Abstract expression interface
    public interface IExpression
    {
        double Interpret(Context context);
        string ToString();
    }

    // Terminal expression: Number
    public class NumberExpression : IExpression
    {
        private readonly double _value;

        public NumberExpression(double value)
        {
            _value = value;
        }

        public double Interpret(Context context)
        {
            return _value;
        }

        public override string ToString()
        {
            return _value.ToString();
        }
    }

    // Terminal expression: Variable
    public class VariableExpression : IExpression
    {
        private readonly string _name;

        public VariableExpression(string name)
        {
            _name = name ?? throw new ArgumentNullException(nameof(name));
        }

        public double Interpret(Context context)
        {
            return context.GetVariable(_name);
        }

        public override string ToString()
        {
            return _name;
        }
    }

    // Non-terminal expression: Addition
    public class AddExpression : IExpression
    {
        private readonly IExpression _left;
        private readonly IExpression _right;

        public AddExpression(IExpression left, IExpression right)
        {
            _left = left ?? throw new ArgumentNullException(nameof(left));
            _right = right ?? throw new ArgumentNullException(nameof(right));
        }

        public double Interpret(Context context)
        {
            return _left.Interpret(context) + _right.Interpret(context);
        }

        public override string ToString()
        {
            return $"({_left} + {_right})";
        }
    }

    // Non-terminal expression: Subtraction
    public class SubtractExpression : IExpression
    {
        private readonly IExpression _left;
        private readonly IExpression _right;

        public SubtractExpression(IExpression left, IExpression right)
        {
            _left = left ?? throw new ArgumentNullException(nameof(left));
            _right = right ?? throw new ArgumentNullException(nameof(right));
        }

        public double Interpret(Context context)
        {
            return _left.Interpret(context) - _right.Interpret(context);
        }

        public override string ToString()
        {
            return $"({_left} - {_right})";
        }
    }

    // Non-terminal expression: Multiplication
    public class MultiplyExpression : IExpression
    {
        private readonly IExpression _left;
        private readonly IExpression _right;

        public MultiplyExpression(IExpression left, IExpression right)
        {
            _left = left ?? throw new ArgumentNullException(nameof(left));
            _right = right ?? throw new ArgumentNullException(nameof(right));
        }

        public double Interpret(Context context)
        {
            return _left.Interpret(context) * _right.Interpret(context);
        }

        public override string ToString()
        {
            return $"({_left} * {_right})";
        }
    }

    // Non-terminal expression: Division
    public class DivideExpression : IExpression
    {
        private readonly IExpression _left;
        private readonly IExpression _right;

        public DivideExpression(IExpression left, IExpression right)
        {
            _left = left ?? throw new ArgumentNullException(nameof(left));
            _right = right ?? throw new ArgumentNullException(nameof(right));
        }

        public double Interpret(Context context)
        {
            double rightValue = _right.Interpret(context);
            if (Math.Abs(rightValue) < 0.0000001)
            {
                throw new DivideByZeroException("Division by zero");
            }
            return _left.Interpret(context) / rightValue;
        }

        public override string ToString()
        {
            return $"({_left} / {_right})";
        }
    }

    // Non-terminal expression: Power
    public class PowerExpression : IExpression
    {
        private readonly IExpression _base;
        private readonly IExpression _exponent;

        public PowerExpression(IExpression baseExpr, IExpression exponent)
        {
            _base = baseExpr ?? throw new ArgumentNullException(nameof(baseExpr));
            _exponent = exponent ?? throw new ArgumentNullException(nameof(exponent));
        }

        public double Interpret(Context context)
        {
            return Math.Pow(_base.Interpret(context), _exponent.Interpret(context));
        }

        public override string ToString()
        {
            return $"({_base} ^ {_exponent})";
        }
    }

    // Non-terminal expression: Square Root
    public class SqrtExpression : IExpression
    {
        private readonly IExpression _expression;

        public SqrtExpression(IExpression expression)
        {
            _expression = expression ?? throw new ArgumentNullException(nameof(expression));
        }

        public double Interpret(Context context)
        {
            double value = _expression.Interpret(context);
            if (value < 0)
            {
                throw new ArgumentException("Cannot take square root of negative number");
            }
            return Math.Sqrt(value);
        }

        public override string ToString()
        {
            return $"sqrt({_expression})";
        }
    }

    // Expression parser
    public class ExpressionParser
    {
        private string _input;
        private int _position;

        public IExpression Parse(string expression)
        {
            if (string.IsNullOrWhiteSpace(expression))
            {
                throw new ArgumentException("Expression cannot be empty", nameof(expression));
            }

            _input = expression.Replace(" ", ""); // Remove whitespace
            _position = 0;

            IExpression result = ParseExpression();

            if (_position < _input.Length)
            {
                throw new InvalidOperationException($"Unexpected character at position {_position}: '{_input[_position]}'");
            }

            return result;
        }

        private IExpression ParseExpression()
        {
            IExpression left = ParseTerm();

            while (_position < _input.Length && (_input[_position] == '+' || _input[_position] == '-'))
            {
                char op = _input[_position];
                _position++;
                IExpression right = ParseTerm();

                if (op == '+')
                {
                    left = new AddExpression(left, right);
                }
                else
                {
                    left = new SubtractExpression(left, right);
                }
            }

            return left;
        }

        private IExpression ParseTerm()
        {
            IExpression left = ParsePower();

            while (_position < _input.Length && (_input[_position] == '*' || _input[_position] == '/'))
            {
                char op = _input[_position];
                _position++;
                IExpression right = ParsePower();

                if (op == '*')
                {
                    left = new MultiplyExpression(left, right);
                }
                else
                {
                    left = new DivideExpression(left, right);
                }
            }

            return left;
        }

        private IExpression ParsePower()
        {
            IExpression left = ParseFactor();

            if (_position < _input.Length && _input[_position] == '^')
            {
                _position++;
                IExpression right = ParsePower(); // Right associative
                left = new PowerExpression(left, right);
            }

            return left;
        }

        private IExpression ParseFactor()
        {
            // Check for function calls
            if (_position < _input.Length && char.IsLetter(_input[_position]))
            {
                string functionName = ParseIdentifier();

                if (functionName.ToLower() == "sqrt")
                {
                    if (_position >= _input.Length || _input[_position] != '(')
                    {
                        // It's a variable, not a function
                        return new VariableExpression(functionName);
                    }

                    _position++; // Skip '('
                    IExpression arg = ParseExpression();

                    if (_position >= _input.Length || _input[_position] != ')')
                    {
                        throw new InvalidOperationException("Expected ')' after function argument");
                    }
                    _position++; // Skip ')'

                    return new SqrtExpression(arg);
                }
                else
                {
                    // It's a variable
                    return new VariableExpression(functionName);
                }
            }

            // Check for parentheses
            if (_position < _input.Length && _input[_position] == '(')
            {
                _position++; // Skip '('
                IExpression expression = ParseExpression();

                if (_position >= _input.Length || _input[_position] != ')')
                {
                    throw new InvalidOperationException("Expected ')' to match '('");
                }
                _position++; // Skip ')'

                return expression;
            }

            // Parse number
            return ParseNumber();
        }

        private IExpression ParseNumber()
        {
            int start = _position;

            // Check for negative sign
            if (_position < _input.Length && _input[_position] == '-')
            {
                _position++;
            }

            // Parse digits and decimal point
            while (_position < _input.Length &&
                   (char.IsDigit(_input[_position]) || _input[_position] == '.'))
            {
                _position++;
            }

            if (start == _position)
            {
                throw new InvalidOperationException($"Expected number at position {_position}");
            }

            string numberStr = _input.Substring(start, _position - start);
            if (double.TryParse(numberStr, out double value))
            {
                return new NumberExpression(value);
            }

            throw new InvalidOperationException($"Invalid number format: '{numberStr}'");
        }

        private string ParseIdentifier()
        {
            int start = _position;

            while (_position < _input.Length &&
                   (char.IsLetterOrDigit(_input[_position]) || _input[_position] == '_'))
            {
                _position++;
            }

            if (start == _position)
            {
                throw new InvalidOperationException($"Expected identifier at position {_position}");
            }

            return _input.Substring(start, _position - start);
        }
    }

    // Expression evaluator with error handling
    public class ExpressionEvaluator
    {
        private readonly ExpressionParser _parser;

        public ExpressionEvaluator()
        {
            _parser = new ExpressionParser();
        }

        public async Task<(bool success, double result, string error)> EvaluateAsync(string expression, Context context)
        {
            return await Task.Run(() =>
            {
                try
                {
                    IExpression expr = _parser.Parse(expression);
                    Console.WriteLine($"[EVALUATOR] Parsed expression: {expr}");

                    double result = expr.Interpret(context);
                    Console.WriteLine($"[EVALUATOR] Result: {result}");

                    return (true, result, null);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[EVALUATOR] Error: {ex.Message}");
                    return (false, 0, ex.Message);
                }
            });
        }

        public async Task<Dictionary<string, double>> EvaluateBatchAsync(List<string> expressions, Context context)
        {
            Dictionary<string, double> results = new Dictionary<string, double>();

            foreach (string expression in expressions)
            {
                (bool success, double result, string error) = await EvaluateAsync(expression, context);
                if (success)
                {
                    results[expression] = result;
                }
            }

            return results;
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Interpreter Pattern - Mathematical Expression Evaluator ===\n");

            try
            {
                ExpressionEvaluator evaluator = new ExpressionEvaluator();
                Context context = new Context();

                // Set up variables
                context.SetVariable("x", 10);
                context.SetVariable("y", 5);
                context.SetVariable("z", 2);

                Console.WriteLine("Variables:");
                foreach (KeyValuePair<string, double> kvp in context.GetAllVariables())
                {
                    Console.WriteLine($"  {kvp.Key} = {kvp.Value}");
                }
                Console.WriteLine();

                // Test basic operations
                Console.WriteLine("=== Basic Operations ===\n");

                await EvaluateAndPrint(evaluator, context, "2 + 3");
                await EvaluateAndPrint(evaluator, context, "10 - 4");
                await EvaluateAndPrint(evaluator, context, "6 * 7");
                await EvaluateAndPrint(evaluator, context, "20 / 4");
                await EvaluateAndPrint(evaluator, context, "2 ^ 8");
                await EvaluateAndPrint(evaluator, context, "sqrt(16)");

                // Test variable expressions
                Console.WriteLine("\n=== Variable Expressions ===\n");

                await EvaluateAndPrint(evaluator, context, "x + y");
                await EvaluateAndPrint(evaluator, context, "x * y");
                await EvaluateAndPrint(evaluator, context, "x ^ z");
                await EvaluateAndPrint(evaluator, context, "sqrt(x + y)");

                // Test complex expressions
                Console.WriteLine("\n=== Complex Expressions ===\n");

                await EvaluateAndPrint(evaluator, context, "x + y * z");
                await EvaluateAndPrint(evaluator, context, "(x + y) * z");
                await EvaluateAndPrint(evaluator, context, "x ^ 2 + y ^ 2");
                await EvaluateAndPrint(evaluator, context, "sqrt(x ^ 2 + y ^ 2)");
                await EvaluateAndPrint(evaluator, context, "(x + y) / (x - y)");
                await EvaluateAndPrint(evaluator, context, "2 * x + 3 * y - z");

                // Test nested operations
                Console.WriteLine("\n=== Nested Operations ===\n");

                await EvaluateAndPrint(evaluator, context, "((x + y) * z) ^ 2");
                await EvaluateAndPrint(evaluator, context, "sqrt(sqrt(256))");
                await EvaluateAndPrint(evaluator, context, "x * (y + z * (x - y))");

                // Test error handling
                Console.WriteLine("\n=== Error Handling ===\n");

                await EvaluateAndPrint(evaluator, context, "10 / 0"); // Division by zero
                await EvaluateAndPrint(evaluator, context, "sqrt(-1)"); // Square root of negative
                await EvaluateAndPrint(evaluator, context, "a + b"); // Undefined variables
                await EvaluateAndPrint(evaluator, context, "x + + y"); // Syntax error

                // Batch evaluation
                Console.WriteLine("\n=== Batch Evaluation ===\n");

                List<string> batchExpressions = new List<string>
                {
                    "x * 2",
                    "y * 3",
                    "z * 4",
                    "x + y + z"
                };

                Dictionary<string, double> batchResults = await evaluator.EvaluateBatchAsync(batchExpressions, context);

                Console.WriteLine("Batch Results:");
                foreach (KeyValuePair<string, double> kvp in batchResults)
                {
                    Console.WriteLine($"  {kvp.Key} = {kvp.Value}");
                }

                // Real-world example: Physics formula
                Console.WriteLine("\n=== Real-World Example: Physics Formulas ===\n");

                Context physics = new Context();
                physics.SetVariable("mass", 75);      // kg
                physics.SetVariable("height", 10);    // meters
                physics.SetVariable("gravity", 9.81); // m/s²
                physics.SetVariable("velocity", 20);  // m/s

                Console.WriteLine("Physics Variables:");
                foreach (KeyValuePair<string, double> kvp in physics.GetAllVariables())
                {
                    Console.WriteLine($"  {kvp.Key} = {kvp.Value}");
                }
                Console.WriteLine();

                await EvaluateAndPrint(evaluator, physics, "mass * gravity * height", "Potential Energy (J)");
                await EvaluateAndPrint(evaluator, physics, "mass * velocity ^ 2 / 2", "Kinetic Energy (J)");
                await EvaluateAndPrint(evaluator, physics, "mass * gravity", "Weight (N)");
                await EvaluateAndPrint(evaluator, physics, "sqrt(2 * gravity * height)", "Impact velocity (m/s)");

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }

        private static async Task EvaluateAndPrint(
            ExpressionEvaluator evaluator,
            Context context,
            string expression,
            string description = null)
        {
            Console.WriteLine($"Expression: {expression}");
            if (!string.IsNullOrEmpty(description))
            {
                Console.WriteLine($"Description: {description}");
            }

            (bool success, double result, string error) = await evaluator.EvaluateAsync(expression, context);

            if (success)
            {
                Console.WriteLine($"Result: {result}");
            }
            else
            {
                Console.WriteLine($"Error: {error}");
            }

            Console.WriteLine();
        }
    }
}
