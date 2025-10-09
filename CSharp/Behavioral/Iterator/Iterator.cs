using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.Iterator
{
    // Real Iterator pattern implementation with IEnumerator<T>
    // Use case: Custom collections with various iteration strategies

    // Binary tree node
    public class TreeNode<T>
    {
        public T Value { get; set; }
        public TreeNode<T> Left { get; set; }
        public TreeNode<T> Right { get; set; }

        public TreeNode(T value)
        {
            Value = value;
        }
    }

    // Binary tree with multiple traversal iterators
    public class BinaryTree<T> : IEnumerable<T>
    {
        private TreeNode<T> _root;

        public void Insert(T value)
        {
            if (_root == null)
            {
                _root = new TreeNode<T>(value);
            }
            else
            {
                InsertRecursive(_root, value);
            }
        }

        private void InsertRecursive(TreeNode<T> node, T value)
        {
            IComparable<T> comparableValue = value as IComparable<T>;
            if (comparableValue == null)
            {
                throw new InvalidOperationException("Type must implement IComparable<T>");
            }

            if (comparableValue.CompareTo(node.Value) < 0)
            {
                if (node.Left == null)
                {
                    node.Left = new TreeNode<T>(value);
                }
                else
                {
                    InsertRecursive(node.Left, value);
                }
            }
            else
            {
                if (node.Right == null)
                {
                    node.Right = new TreeNode<T>(value);
                }
                else
                {
                    InsertRecursive(node.Right, value);
                }
            }
        }

        // Default iterator (in-order traversal)
        public IEnumerator<T> GetEnumerator()
        {
            return GetInOrderEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        // In-order traversal iterator (Left -> Root -> Right)
        public IEnumerator<T> GetInOrderEnumerator()
        {
            return InOrderTraversal(_root).GetEnumerator();
        }

        private IEnumerable<T> InOrderTraversal(TreeNode<T> node)
        {
            if (node != null)
            {
                foreach (T value in InOrderTraversal(node.Left))
                {
                    yield return value;
                }
                yield return node.Value;
                foreach (T value in InOrderTraversal(node.Right))
                {
                    yield return value;
                }
            }
        }

        // Pre-order traversal iterator (Root -> Left -> Right)
        public IEnumerator<T> GetPreOrderEnumerator()
        {
            return PreOrderTraversal(_root).GetEnumerator();
        }

        private IEnumerable<T> PreOrderTraversal(TreeNode<T> node)
        {
            if (node != null)
            {
                yield return node.Value;
                foreach (T value in PreOrderTraversal(node.Left))
                {
                    yield return value;
                }
                foreach (T value in PreOrderTraversal(node.Right))
                {
                    yield return value;
                }
            }
        }

        // Post-order traversal iterator (Left -> Right -> Root)
        public IEnumerator<T> GetPostOrderEnumerator()
        {
            return PostOrderTraversal(_root).GetEnumerator();
        }

        private IEnumerable<T> PostOrderTraversal(TreeNode<T> node)
        {
            if (node != null)
            {
                foreach (T value in PostOrderTraversal(node.Left))
                {
                    yield return value;
                }
                foreach (T value in PostOrderTraversal(node.Right))
                {
                    yield return value;
                }
                yield return node.Value;
            }
        }

        // Level-order (breadth-first) traversal iterator
        public IEnumerator<T> GetLevelOrderEnumerator()
        {
            return LevelOrderTraversal().GetEnumerator();
        }

        private IEnumerable<T> LevelOrderTraversal()
        {
            if (_root == null)
            {
                yield break;
            }

            Queue<TreeNode<T>> queue = new Queue<TreeNode<T>>();
            queue.Enqueue(_root);

            while (queue.Count > 0)
            {
                TreeNode<T> node = queue.Dequeue();
                yield return node.Value;

                if (node.Left != null)
                {
                    queue.Enqueue(node.Left);
                }
                if (node.Right != null)
                {
                    queue.Enqueue(node.Right);
                }
            }
        }
    }

    // Paginated collection iterator
    public class PaginatedCollection<T> : IEnumerable<T>
    {
        private readonly List<T> _items;
        private readonly int _pageSize;

        public PaginatedCollection(IEnumerable<T> items, int pageSize)
        {
            if (items == null)
            {
                throw new ArgumentNullException(nameof(items));
            }
            if (pageSize <= 0)
            {
                throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));
            }

            _items = new List<T>(items);
            _pageSize = pageSize;
        }

        public int PageCount => (_items.Count + _pageSize - 1) / _pageSize;
        public int TotalItems => _items.Count;

        public IEnumerator<T> GetEnumerator()
        {
            return _items.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        // Page-by-page iterator
        public IEnumerable<List<T>> GetPages()
        {
            for (int i = 0; i < _items.Count; i += _pageSize)
            {
                int remaining = Math.Min(_pageSize, _items.Count - i);
                List<T> page = _items.GetRange(i, remaining);
                yield return page;
            }
        }

        // Get specific page
        public List<T> GetPage(int pageNumber)
        {
            if (pageNumber < 0 || pageNumber >= PageCount)
            {
                throw new ArgumentOutOfRangeException(nameof(pageNumber));
            }

            int startIndex = pageNumber * _pageSize;
            int remaining = Math.Min(_pageSize, _items.Count - startIndex);
            return _items.GetRange(startIndex, remaining);
        }
    }

    // Filtered iterator
    public class FilteredCollection<T> : IEnumerable<T>
    {
        private readonly IEnumerable<T> _source;
        private readonly Predicate<T> _filter;

        public FilteredCollection(IEnumerable<T> source, Predicate<T> filter)
        {
            _source = source ?? throw new ArgumentNullException(nameof(source));
            _filter = filter ?? throw new ArgumentNullException(nameof(filter));
        }

        public IEnumerator<T> GetEnumerator()
        {
            foreach (T item in _source)
            {
                if (_filter(item))
                {
                    yield return item;
                }
            }
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

    // Batched iterator
    public class BatchedCollection<T> : IEnumerable<List<T>>
    {
        private readonly IEnumerable<T> _source;
        private readonly int _batchSize;

        public BatchedCollection(IEnumerable<T> source, int batchSize)
        {
            _source = source ?? throw new ArgumentNullException(nameof(source));
            if (batchSize <= 0)
            {
                throw new ArgumentException("Batch size must be greater than 0", nameof(batchSize));
            }
            _batchSize = batchSize;
        }

        public IEnumerator<List<T>> GetEnumerator()
        {
            List<T> batch = new List<T>(_batchSize);

            foreach (T item in _source)
            {
                batch.Add(item);

                if (batch.Count >= _batchSize)
                {
                    yield return batch;
                    batch = new List<T>(_batchSize);
                }
            }

            if (batch.Count > 0)
            {
                yield return batch;
            }
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }

    // Infinite sequence generator
    public class InfiniteSequence : IEnumerable<int>
    {
        public IEnumerator<int> GetEnumerator()
        {
            return GetFibonacciSequence().GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        private IEnumerable<int> GetFibonacciSequence()
        {
            int a = 0, b = 1;
            yield return a;
            yield return b;

            while (true)
            {
                int next = a + b;
                if (next < 0) // Overflow check
                {
                    yield break;
                }
                yield return next;
                a = b;
                b = next;
            }
        }

        public IEnumerable<int> GetPrimeNumbers()
        {
            yield return 2;

            int candidate = 3;
            List<int> primes = new List<int> { 2 };

            while (candidate > 0) // Overflow check
            {
                bool isPrime = true;
                int sqrt = (int)Math.Sqrt(candidate);

                foreach (int prime in primes)
                {
                    if (prime > sqrt)
                    {
                        break;
                    }
                    if (candidate % prime == 0)
                    {
                        isPrime = false;
                        break;
                    }
                }

                if (isPrime)
                {
                    primes.Add(candidate);
                    yield return candidate;
                }

                candidate += 2; // Skip even numbers
            }
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Iterator Pattern - Custom Collection Traversal ===\n");

            try
            {
                // Binary tree with multiple traversal strategies
                Console.WriteLine("=== Binary Tree Traversals ===\n");
                BinaryTree<int> tree = new BinaryTree<int>();
                int[] values = { 50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45 };

                foreach (int value in values)
                {
                    tree.Insert(value);
                }

                Console.WriteLine("In-Order (sorted): " + string.Join(", ", tree));

                Console.Write("Pre-Order: ");
                using (IEnumerator<int> enumerator = tree.GetPreOrderEnumerator())
                {
                    List<int> preOrder = new List<int>();
                    while (enumerator.MoveNext())
                    {
                        preOrder.Add(enumerator.Current);
                    }
                    Console.WriteLine(string.Join(", ", preOrder));
                }

                Console.Write("Post-Order: ");
                using (IEnumerator<int> enumerator = tree.GetPostOrderEnumerator())
                {
                    List<int> postOrder = new List<int>();
                    while (enumerator.MoveNext())
                    {
                        postOrder.Add(enumerator.Current);
                    }
                    Console.WriteLine(string.Join(", ", postOrder));
                }

                Console.Write("Level-Order (BFS): ");
                using (IEnumerator<int> enumerator = tree.GetLevelOrderEnumerator())
                {
                    List<int> levelOrder = new List<int>();
                    while (enumerator.MoveNext())
                    {
                        levelOrder.Add(enumerator.Current);
                    }
                    Console.WriteLine(string.Join(", ", levelOrder));
                }

                // Paginated collection
                Console.WriteLine("\n=== Paginated Collection ===\n");
                List<string> products = Enumerable.Range(1, 25)
                    .Select(i => $"Product-{i:D3}")
                    .ToList();

                PaginatedCollection<string> paginated = new PaginatedCollection<string>(products, 7);
                Console.WriteLine($"Total items: {paginated.TotalItems}, Pages: {paginated.PageCount}\n");

                int pageNum = 0;
                foreach (List<string> page in paginated.GetPages())
                {
                    Console.WriteLine($"Page {pageNum + 1}: {string.Join(", ", page)}");
                    pageNum++;
                }

                // Filtered collection
                Console.WriteLine("\n=== Filtered Collection ===\n");
                List<int> numbers = Enumerable.Range(1, 20).ToList();
                FilteredCollection<int> evenNumbers = new FilteredCollection<int>(
                    numbers,
                    n => n % 2 == 0
                );

                Console.WriteLine($"Original: {string.Join(", ", numbers)}");
                Console.WriteLine($"Even only: {string.Join(", ", evenNumbers)}");

                // Batched collection
                Console.WriteLine("\n=== Batched Collection ===\n");
                List<int> data = Enumerable.Range(1, 17).ToList();
                BatchedCollection<int> batched = new BatchedCollection<int>(data, 5);

                int batchNum = 1;
                foreach (List<int> batch in batched)
                {
                    Console.WriteLine($"Batch {batchNum}: {string.Join(", ", batch)}");
                    batchNum++;
                }

                // Infinite sequences
                Console.WriteLine("\n=== Infinite Sequences ===\n");
                InfiniteSequence infinite = new InfiniteSequence();

                Console.WriteLine("First 15 Fibonacci numbers:");
                Console.WriteLine(string.Join(", ", infinite.Take(15)));

                Console.WriteLine("\nFirst 20 Prime numbers:");
                Console.WriteLine(string.Join(", ", infinite.GetPrimeNumbers().Take(20)));

                // Async iteration simulation
                Console.WriteLine("\n=== Async Processing with Iterator ===\n");
                await ProcessBatchesAsync(data, 4);

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }

        private static async Task ProcessBatchesAsync(List<int> data, int batchSize)
        {
            BatchedCollection<int> batches = new BatchedCollection<int>(data, batchSize);
            int batchNumber = 1;

            foreach (List<int> batch in batches)
            {
                Console.WriteLine($"Processing batch {batchNumber}...");
                await Task.Delay(100); // Simulate async processing

                int sum = batch.Sum();
                double average = batch.Average();
                Console.WriteLine($"  Items: {string.Join(", ", batch)}");
                Console.WriteLine($"  Sum: {sum}, Average: {average:F2}");

                batchNumber++;
            }
        }
    }
}
