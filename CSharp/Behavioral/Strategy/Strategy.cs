using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.Strategy
{
    // Real Strategy pattern implementation with actual algorithms
    // Use case: Data processing pipeline with different sorting and encryption strategies

    // Sorting strategies
    public interface ISortStrategy<T> where T : IComparable<T>
    {
        List<T> Sort(List<T> data);
        string GetAlgorithmName();
    }

    public class QuickSortStrategy<T> : ISortStrategy<T> where T : IComparable<T>
    {
        public List<T> Sort(List<T> data)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data));
            }

            List<T> result = new List<T>(data);
            QuickSort(result, 0, result.Count - 1);
            return result;
        }

        private void QuickSort(List<T> arr, int low, int high)
        {
            if (low < high)
            {
                int pivotIndex = Partition(arr, low, high);
                QuickSort(arr, low, pivotIndex - 1);
                QuickSort(arr, pivotIndex + 1, high);
            }
        }

        private int Partition(List<T> arr, int low, int high)
        {
            T pivot = arr[high];
            int i = low - 1;

            for (int j = low; j < high; j++)
            {
                if (arr[j].CompareTo(pivot) <= 0)
                {
                    i++;
                    T temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }

            T temp2 = arr[i + 1];
            arr[i + 1] = arr[high];
            arr[high] = temp2;

            return i + 1;
        }

        public string GetAlgorithmName() => "QuickSort";
    }

    public class MergeSortStrategy<T> : ISortStrategy<T> where T : IComparable<T>
    {
        public List<T> Sort(List<T> data)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data));
            }

            List<T> result = new List<T>(data);
            MergeSort(result, 0, result.Count - 1);
            return result;
        }

        private void MergeSort(List<T> arr, int left, int right)
        {
            if (left < right)
            {
                int middle = left + (right - left) / 2;
                MergeSort(arr, left, middle);
                MergeSort(arr, middle + 1, right);
                Merge(arr, left, middle, right);
            }
        }

        private void Merge(List<T> arr, int left, int middle, int right)
        {
            int leftSize = middle - left + 1;
            int rightSize = right - middle;

            T[] leftArray = new T[leftSize];
            T[] rightArray = new T[rightSize];

            for (int i = 0; i < leftSize; i++)
                leftArray[i] = arr[left + i];
            for (int j = 0; j < rightSize; j++)
                rightArray[j] = arr[middle + 1 + j];

            int iIndex = 0, jIndex = 0;
            int k = left;

            while (iIndex < leftSize && jIndex < rightSize)
            {
                if (leftArray[iIndex].CompareTo(rightArray[jIndex]) <= 0)
                {
                    arr[k] = leftArray[iIndex];
                    iIndex++;
                }
                else
                {
                    arr[k] = rightArray[jIndex];
                    jIndex++;
                }
                k++;
            }

            while (iIndex < leftSize)
            {
                arr[k] = leftArray[iIndex];
                iIndex++;
                k++;
            }

            while (jIndex < rightSize)
            {
                arr[k] = rightArray[jIndex];
                jIndex++;
                k++;
            }
        }

        public string GetAlgorithmName() => "MergeSort";
    }

    public class HeapSortStrategy<T> : ISortStrategy<T> where T : IComparable<T>
    {
        public List<T> Sort(List<T> data)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data));
            }

            List<T> result = new List<T>(data);
            int n = result.Count;

            for (int i = n / 2 - 1; i >= 0; i--)
                Heapify(result, n, i);

            for (int i = n - 1; i > 0; i--)
            {
                T temp = result[0];
                result[0] = result[i];
                result[i] = temp;

                Heapify(result, i, 0);
            }

            return result;
        }

        private void Heapify(List<T> arr, int n, int i)
        {
            int largest = i;
            int left = 2 * i + 1;
            int right = 2 * i + 2;

            if (left < n && arr[left].CompareTo(arr[largest]) > 0)
                largest = left;

            if (right < n && arr[right].CompareTo(arr[largest]) > 0)
                largest = right;

            if (largest != i)
            {
                T swap = arr[i];
                arr[i] = arr[largest];
                arr[largest] = swap;

                Heapify(arr, n, largest);
            }
        }

        public string GetAlgorithmName() => "HeapSort";
    }

    public class LinqSortStrategy<T> : ISortStrategy<T> where T : IComparable<T>
    {
        public List<T> Sort(List<T> data)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data));
            }

            return data.OrderBy(x => x).ToList();
        }

        public string GetAlgorithmName() => "LINQ OrderBy";
    }

    // Encryption strategies
    public interface IEncryptionStrategy
    {
        byte[] Encrypt(byte[] data, byte[] key);
        byte[] Decrypt(byte[] encryptedData, byte[] key);
        string GetAlgorithmName();
    }

    public class AesEncryptionStrategy : IEncryptionStrategy
    {
        public byte[] Encrypt(byte[] data, byte[] key)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data));
            }
            if (key == null || key.Length != 32)
            {
                throw new ArgumentException("Key must be 32 bytes for AES-256", nameof(key));
            }

            using (Aes aes = Aes.Create())
            {
                aes.Key = key;
                aes.GenerateIV();

                using (ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                {
                    byte[] encrypted = encryptor.TransformFinalBlock(data, 0, data.Length);

                    // Prepend IV to encrypted data
                    byte[] result = new byte[aes.IV.Length + encrypted.Length];
                    Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
                    Buffer.BlockCopy(encrypted, 0, result, aes.IV.Length, encrypted.Length);

                    return result;
                }
            }
        }

        public byte[] Decrypt(byte[] encryptedData, byte[] key)
        {
            if (encryptedData == null)
            {
                throw new ArgumentNullException(nameof(encryptedData));
            }
            if (key == null || key.Length != 32)
            {
                throw new ArgumentException("Key must be 32 bytes for AES-256", nameof(key));
            }

            using (Aes aes = Aes.Create())
            {
                aes.Key = key;

                // Extract IV from encrypted data
                byte[] iv = new byte[aes.IV.Length];
                Buffer.BlockCopy(encryptedData, 0, iv, 0, iv.Length);
                aes.IV = iv;

                byte[] cipherText = new byte[encryptedData.Length - iv.Length];
                Buffer.BlockCopy(encryptedData, iv.Length, cipherText, 0, cipherText.Length);

                using (ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                {
                    return decryptor.TransformFinalBlock(cipherText, 0, cipherText.Length);
                }
            }
        }

        public string GetAlgorithmName() => "AES-256";
    }

    public class XorEncryptionStrategy : IEncryptionStrategy
    {
        public byte[] Encrypt(byte[] data, byte[] key)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data));
            }
            if (key == null || key.Length == 0)
            {
                throw new ArgumentException("Key cannot be empty", nameof(key));
            }

            byte[] result = new byte[data.Length];
            for (int i = 0; i < data.Length; i++)
            {
                result[i] = (byte)(data[i] ^ key[i % key.Length]);
            }
            return result;
        }

        public byte[] Decrypt(byte[] encryptedData, byte[] key)
        {
            // XOR encryption is symmetric
            return Encrypt(encryptedData, key);
        }

        public string GetAlgorithmName() => "XOR";
    }

    // Data processor with strategies
    public class DataProcessor<T> where T : IComparable<T>
    {
        private ISortStrategy<T> _sortStrategy;
        private IEncryptionStrategy _encryptionStrategy;

        public DataProcessor(ISortStrategy<T> sortStrategy, IEncryptionStrategy encryptionStrategy)
        {
            _sortStrategy = sortStrategy ?? throw new ArgumentNullException(nameof(sortStrategy));
            _encryptionStrategy = encryptionStrategy ?? throw new ArgumentNullException(nameof(encryptionStrategy));
        }

        public void SetSortStrategy(ISortStrategy<T> strategy)
        {
            _sortStrategy = strategy ?? throw new ArgumentNullException(nameof(strategy));
        }

        public void SetEncryptionStrategy(IEncryptionStrategy strategy)
        {
            _encryptionStrategy = strategy ?? throw new ArgumentNullException(nameof(strategy));
        }

        public List<T> ProcessData(List<T> data)
        {
            if (data == null)
            {
                throw new ArgumentNullException(nameof(data));
            }

            Console.WriteLine($"Processing data using {_sortStrategy.GetAlgorithmName()}...");
            List<T> sorted = _sortStrategy.Sort(data);
            Console.WriteLine($"Sorted {sorted.Count} items");

            return sorted;
        }

        public async Task<(byte[] encrypted, byte[] key)> EncryptDataAsync(string text)
        {
            if (text == null)
            {
                throw new ArgumentNullException(nameof(text));
            }

            return await Task.Run(() =>
            {
                Console.WriteLine($"Encrypting data using {_encryptionStrategy.GetAlgorithmName()}...");

                byte[] data = Encoding.UTF8.GetBytes(text);
                byte[] key = GenerateKey(_encryptionStrategy.GetAlgorithmName() == "AES-256" ? 32 : 16);
                byte[] encrypted = _encryptionStrategy.Encrypt(data, key);

                Console.WriteLine($"Encrypted {data.Length} bytes to {encrypted.Length} bytes");

                return (encrypted, key);
            });
        }

        public async Task<string> DecryptDataAsync(byte[] encryptedData, byte[] key)
        {
            if (encryptedData == null)
            {
                throw new ArgumentNullException(nameof(encryptedData));
            }
            if (key == null)
            {
                throw new ArgumentNullException(nameof(key));
            }

            return await Task.Run(() =>
            {
                Console.WriteLine($"Decrypting data using {_encryptionStrategy.GetAlgorithmName()}...");

                byte[] decrypted = _encryptionStrategy.Decrypt(encryptedData, key);
                string result = Encoding.UTF8.GetString(decrypted);

                Console.WriteLine($"Decrypted {encryptedData.Length} bytes to {decrypted.Length} bytes");

                return result;
            });
        }

        private byte[] GenerateKey(int size)
        {
            byte[] key = new byte[size];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(key);
            }
            return key;
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Strategy Pattern - Data Processing with Multiple Algorithms ===\n");

            try
            {
                // Test sorting strategies
                List<int> numbers = new List<int> { 64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 33, 17, 29 };
                Console.WriteLine($"Original data: {string.Join(", ", numbers)}\n");

                ISortStrategy<int>[] sortStrategies = new ISortStrategy<int>[]
                {
                    new QuickSortStrategy<int>(),
                    new MergeSortStrategy<int>(),
                    new HeapSortStrategy<int>(),
                    new LinqSortStrategy<int>()
                };

                foreach (ISortStrategy<int> strategy in sortStrategies)
                {
                    DataProcessor<int> processor = new DataProcessor<int>(strategy, new XorEncryptionStrategy());
                    List<int> sorted = processor.ProcessData(numbers);
                    Console.WriteLine($"Result: {string.Join(", ", sorted)}\n");
                }

                // Test encryption strategies
                Console.WriteLine("\n=== Testing Encryption Strategies ===\n");

                string secretMessage = "This is a confidential message that needs to be encrypted!";
                Console.WriteLine($"Original message: \"{secretMessage}\"\n");

                IEncryptionStrategy[] encryptionStrategies = new IEncryptionStrategy[]
                {
                    new AesEncryptionStrategy(),
                    new XorEncryptionStrategy()
                };

                foreach (IEncryptionStrategy encStrategy in encryptionStrategies)
                {
                    DataProcessor<int> processor = new DataProcessor<int>(new LinqSortStrategy<int>(), encStrategy);

                    (byte[] encrypted, byte[] key) = await processor.EncryptDataAsync(secretMessage);
                    Console.WriteLine($"Encrypted (Base64): {Convert.ToBase64String(encrypted).Substring(0, Math.Min(50, Convert.ToBase64String(encrypted).Length))}...");
                    Console.WriteLine($"Key (Base64): {Convert.ToBase64String(key).Substring(0, Math.Min(30, Convert.ToBase64String(key).Length))}...");

                    string decrypted = await processor.DecryptDataAsync(encrypted, key);
                    Console.WriteLine($"Decrypted message: \"{decrypted}\"");
                    Console.WriteLine($"Match: {secretMessage == decrypted}\n");
                }

                // Dynamic strategy switching
                Console.WriteLine("\n=== Testing Dynamic Strategy Switching ===\n");

                DataProcessor<string> stringProcessor = new DataProcessor<string>(
                    new QuickSortStrategy<string>(),
                    new AesEncryptionStrategy()
                );

                List<string> words = new List<string> { "zebra", "apple", "mango", "banana", "cherry" };
                Console.WriteLine($"Words: {string.Join(", ", words)}");

                stringProcessor.ProcessData(words);

                Console.WriteLine("\nSwitching to MergeSort...");
                stringProcessor.SetSortStrategy(new MergeSortStrategy<string>());
                stringProcessor.ProcessData(words);

                Console.WriteLine("\nSwitching to HeapSort...");
                stringProcessor.SetSortStrategy(new HeapSortStrategy<string>());
                List<string> sortedWords = stringProcessor.ProcessData(words);
                Console.WriteLine($"Final result: {string.Join(", ", sortedWords)}");

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }
    }
}
