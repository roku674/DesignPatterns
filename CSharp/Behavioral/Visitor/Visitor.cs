using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.Visitor
{
    // Real Visitor pattern implementation
    // Use case: File system operations with different visitors (size calculation, search, compression analysis)

    // Visitor interface
    public interface IFileSystemVisitor
    {
        void VisitFile(FileNode file);
        void VisitDirectory(DirectoryNode directory);
        void VisitSymbolicLink(SymbolicLinkNode link);
    }

    // Element interface
    public interface IFileSystemNode
    {
        string Name { get; }
        string Path { get; }
        DateTime CreatedDate { get; }
        void Accept(IFileSystemVisitor visitor);
    }

    // Concrete element: File
    public class FileNode : IFileSystemNode
    {
        public string Name { get; private set; }
        public string Path { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public long SizeBytes { get; private set; }
        public string Extension { get; private set; }
        public string MimeType { get; private set; }

        public FileNode(string name, string path, long sizeBytes, string extension, string mimeType)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Path = path ?? throw new ArgumentNullException(nameof(path));
            SizeBytes = sizeBytes;
            Extension = extension ?? "";
            MimeType = mimeType ?? "application/octet-stream";
            CreatedDate = DateTime.UtcNow;
        }

        public void Accept(IFileSystemVisitor visitor)
        {
            visitor.VisitFile(this);
        }
    }

    // Concrete element: Directory
    public class DirectoryNode : IFileSystemNode
    {
        private readonly List<IFileSystemNode> _children;

        public string Name { get; private set; }
        public string Path { get; private set; }
        public DateTime CreatedDate { get; private set; }

        public DirectoryNode(string name, string path)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Path = path ?? throw new ArgumentNullException(nameof(path));
            CreatedDate = DateTime.UtcNow;
            _children = new List<IFileSystemNode>();
        }

        public void AddChild(IFileSystemNode node)
        {
            if (node == null)
            {
                throw new ArgumentNullException(nameof(node));
            }
            _children.Add(node);
        }

        public IReadOnlyList<IFileSystemNode> GetChildren()
        {
            return _children.AsReadOnly();
        }

        public void Accept(IFileSystemVisitor visitor)
        {
            visitor.VisitDirectory(this);

            // Visit all children
            foreach (IFileSystemNode child in _children)
            {
                child.Accept(visitor);
            }
        }
    }

    // Concrete element: Symbolic Link
    public class SymbolicLinkNode : IFileSystemNode
    {
        public string Name { get; private set; }
        public string Path { get; private set; }
        public DateTime CreatedDate { get; private set; }
        public string TargetPath { get; private set; }

        public SymbolicLinkNode(string name, string path, string targetPath)
        {
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Path = path ?? throw new ArgumentNullException(nameof(path));
            TargetPath = targetPath ?? throw new ArgumentNullException(nameof(targetPath));
            CreatedDate = DateTime.UtcNow;
        }

        public void Accept(IFileSystemVisitor visitor)
        {
            visitor.VisitSymbolicLink(this);
        }
    }

    // Concrete visitor: Size Calculator
    public class SizeCalculatorVisitor : IFileSystemVisitor
    {
        private long _totalSize;
        private int _fileCount;
        private int _directoryCount;
        private readonly Dictionary<string, long> _sizeByExtension;

        public SizeCalculatorVisitor()
        {
            _totalSize = 0;
            _fileCount = 0;
            _directoryCount = 0;
            _sizeByExtension = new Dictionary<string, long>();
        }

        public void VisitFile(FileNode file)
        {
            _totalSize += file.SizeBytes;
            _fileCount++;

            if (!string.IsNullOrEmpty(file.Extension))
            {
                if (!_sizeByExtension.ContainsKey(file.Extension))
                {
                    _sizeByExtension[file.Extension] = 0;
                }
                _sizeByExtension[file.Extension] += file.SizeBytes;
            }

            Console.WriteLine($"[SIZE] File: {file.Path} ({FormatBytes(file.SizeBytes)})");
        }

        public void VisitDirectory(DirectoryNode directory)
        {
            _directoryCount++;
            Console.WriteLine($"[SIZE] Directory: {directory.Path}");
        }

        public void VisitSymbolicLink(SymbolicLinkNode link)
        {
            Console.WriteLine($"[SIZE] Symbolic Link: {link.Path} → {link.TargetPath}");
        }

        public long GetTotalSize() => _totalSize;
        public int GetFileCount() => _fileCount;
        public int GetDirectoryCount() => _directoryCount;

        public Dictionary<string, long> GetSizeByExtension()
        {
            return new Dictionary<string, long>(_sizeByExtension);
        }

        public void PrintSummary()
        {
            Console.WriteLine("\n=== Size Calculator Summary ===");
            Console.WriteLine($"Total Size: {FormatBytes(_totalSize)}");
            Console.WriteLine($"Files: {_fileCount}");
            Console.WriteLine($"Directories: {_directoryCount}");

            if (_sizeByExtension.Count > 0)
            {
                Console.WriteLine("\nSize by Extension:");
                foreach (KeyValuePair<string, long> kvp in _sizeByExtension.OrderByDescending(x => x.Value))
                {
                    double percentage = (_totalSize > 0) ? (kvp.Value * 100.0 / _totalSize) : 0;
                    Console.WriteLine($"  {kvp.Key}: {FormatBytes(kvp.Value)} ({percentage:F1}%)");
                }
            }
            Console.WriteLine();
        }

        private string FormatBytes(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;

            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }

            return $"{len:F2} {sizes[order]}";
        }
    }

    // Concrete visitor: File Searcher
    public class FileSearchVisitor : IFileSystemVisitor
    {
        private readonly string _searchPattern;
        private readonly List<IFileSystemNode> _matchedNodes;
        private readonly bool _caseSensitive;

        public FileSearchVisitor(string searchPattern, bool caseSensitive = false)
        {
            _searchPattern = searchPattern ?? throw new ArgumentNullException(nameof(searchPattern));
            _matchedNodes = new List<IFileSystemNode>();
            _caseSensitive = caseSensitive;
        }

        public void VisitFile(FileNode file)
        {
            if (Matches(file.Name))
            {
                _matchedNodes.Add(file);
                Console.WriteLine($"[SEARCH] MATCH: File {file.Path}");
            }
        }

        public void VisitDirectory(DirectoryNode directory)
        {
            if (Matches(directory.Name))
            {
                _matchedNodes.Add(directory);
                Console.WriteLine($"[SEARCH] MATCH: Directory {directory.Path}");
            }
        }

        public void VisitSymbolicLink(SymbolicLinkNode link)
        {
            if (Matches(link.Name))
            {
                _matchedNodes.Add(link);
                Console.WriteLine($"[SEARCH] MATCH: Link {link.Path}");
            }
        }

        private bool Matches(string name)
        {
            if (_caseSensitive)
            {
                return name.Contains(_searchPattern);
            }
            return name.ToLower().Contains(_searchPattern.ToLower());
        }

        public List<IFileSystemNode> GetMatches()
        {
            return new List<IFileSystemNode>(_matchedNodes);
        }

        public void PrintSummary()
        {
            Console.WriteLine($"\n=== Search Results for '{_searchPattern}' ===");
            Console.WriteLine($"Found {_matchedNodes.Count} matches");
            Console.WriteLine();
        }
    }

    // Concrete visitor: Report Generator
    public class ReportGeneratorVisitor : IFileSystemVisitor
    {
        private readonly StringBuilder _report;
        private int _indentLevel;
        private int _totalFiles;
        private int _totalDirectories;

        public ReportGeneratorVisitor()
        {
            _report = new StringBuilder();
            _indentLevel = 0;
            _totalFiles = 0;
            _totalDirectories = 0;

            _report.AppendLine("File System Report");
            _report.AppendLine("==================");
            _report.AppendLine();
        }

        public void VisitFile(FileNode file)
        {
            _totalFiles++;
            string indent = new string(' ', _indentLevel * 2);
            _report.AppendLine($"{indent}📄 {file.Name} ({FormatBytes(file.SizeBytes)}) [{file.Extension}]");
        }

        public void VisitDirectory(DirectoryNode directory)
        {
            _totalDirectories++;
            string indent = new string(' ', _indentLevel * 2);
            _report.AppendLine($"{indent}📁 {directory.Name}/");
            _indentLevel++;

            // Visit children
            foreach (IFileSystemNode child in directory.GetChildren())
            {
                // Children will be visited automatically by the directory's Accept method
            }

            _indentLevel--;
        }

        public void VisitSymbolicLink(SymbolicLinkNode link)
        {
            string indent = new string(' ', _indentLevel * 2);
            _report.AppendLine($"{indent}🔗 {link.Name} → {link.TargetPath}");
        }

        public string GetReport()
        {
            StringBuilder finalReport = new StringBuilder(_report.ToString());
            finalReport.AppendLine();
            finalReport.AppendLine("==================");
            finalReport.AppendLine($"Total Files: {_totalFiles}");
            finalReport.AppendLine($"Total Directories: {_totalDirectories}");
            finalReport.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}");

            return finalReport.ToString();
        }

        private string FormatBytes(long bytes)
        {
            if (bytes < 1024) return $"{bytes} B";
            if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
            if (bytes < 1024 * 1024 * 1024) return $"{bytes / (1024.0 * 1024):F1} MB";
            return $"{bytes / (1024.0 * 1024 * 1024):F1} GB";
        }
    }

    // Concrete visitor: Compression Analyzer
    public class CompressionAnalyzerVisitor : IFileSystemVisitor
    {
        private readonly Dictionary<string, (int count, long totalSize)> _compressionStats;
        private long _totalCompressibleSize;
        private int _compressibleFiles;

        public CompressionAnalyzerVisitor()
        {
            _compressionStats = new Dictionary<string, (int, long)>();
            _totalCompressibleSize = 0;
            _compressibleFiles = 0;
        }

        public void VisitFile(FileNode file)
        {
            string category = GetCompressionCategory(file.Extension);

            if (!_compressionStats.ContainsKey(category))
            {
                _compressionStats[category] = (0, 0);
            }

            (int count, long size) = _compressionStats[category];
            _compressionStats[category] = (count + 1, size + file.SizeBytes);

            if (IsCompressible(file.Extension))
            {
                _compressibleFiles++;
                _totalCompressibleSize += file.SizeBytes;
                long estimatedCompressed = EstimateCompressedSize(file.SizeBytes, file.Extension);
                long savings = file.SizeBytes - estimatedCompressed;

                Console.WriteLine($"[COMPRESSION] {file.Path}: " +
                                $"{FormatBytes(file.SizeBytes)} → {FormatBytes(estimatedCompressed)} " +
                                $"(Save {FormatBytes(savings)})");
            }
        }

        public void VisitDirectory(DirectoryNode directory)
        {
            // Directories don't affect compression analysis
        }

        public void VisitSymbolicLink(SymbolicLinkNode link)
        {
            // Symbolic links don't affect compression analysis
        }

        private string GetCompressionCategory(string extension)
        {
            string[] alreadyCompressed = { ".zip", ".rar", ".7z", ".gz", ".jpg", ".png", ".mp4", ".mp3" };
            string[] highlyCompressible = { ".txt", ".csv", ".log", ".json", ".xml", ".html" };
            string[] moderatelyCompressible = { ".doc", ".pdf", ".ppt" };

            extension = extension.ToLower();

            if (alreadyCompressed.Contains(extension))
            {
                return "Already Compressed";
            }
            if (highlyCompressible.Contains(extension))
            {
                return "Highly Compressible";
            }
            if (moderatelyCompressible.Contains(extension))
            {
                return "Moderately Compressible";
            }

            return "Other";
        }

        private bool IsCompressible(string extension)
        {
            string[] compressible = { ".txt", ".csv", ".log", ".json", ".xml", ".html", ".doc", ".pdf" };
            return compressible.Contains(extension.ToLower());
        }

        private long EstimateCompressedSize(long originalSize, string extension)
        {
            Dictionary<string, double> compressionRatios = new Dictionary<string, double>
            {
                { ".txt", 0.3 },
                { ".csv", 0.4 },
                { ".log", 0.35 },
                { ".json", 0.4 },
                { ".xml", 0.35 },
                { ".html", 0.4 },
                { ".doc", 0.6 },
                { ".pdf", 0.9 }
            };

            extension = extension.ToLower();
            double ratio = compressionRatios.ContainsKey(extension) ? compressionRatios[extension] : 0.7;

            return (long)(originalSize * ratio);
        }

        public void PrintSummary()
        {
            Console.WriteLine("\n=== Compression Analysis Summary ===");
            Console.WriteLine($"Compressible Files: {_compressibleFiles}");
            Console.WriteLine($"Total Compressible Size: {FormatBytes(_totalCompressibleSize)}");

            long estimatedCompressed = 0;
            foreach (KeyValuePair<string, (int count, long size)> kvp in _compressionStats)
            {
                if (kvp.Key != "Already Compressed")
                {
                    estimatedCompressed += (long)(kvp.Value.size * 0.5); // Average 50% compression
                }
            }

            long estimatedSavings = _totalCompressibleSize - estimatedCompressed;
            double savingsPercent = _totalCompressibleSize > 0
                ? (estimatedSavings * 100.0 / _totalCompressibleSize)
                : 0;

            Console.WriteLine($"Estimated Savings: {FormatBytes(estimatedSavings)} ({savingsPercent:F1}%)");

            Console.WriteLine("\nBy Category:");
            foreach (KeyValuePair<string, (int count, long size)> kvp in _compressionStats.OrderByDescending(x => x.Value.size))
            {
                Console.WriteLine($"  {kvp.Key}: {kvp.Value.count} files, {FormatBytes(kvp.Value.size)}");
            }
            Console.WriteLine();
        }

        private string FormatBytes(long bytes)
        {
            if (bytes < 1024) return $"{bytes} B";
            if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
            if (bytes < 1024 * 1024 * 1024) return $"{bytes / (1024.0 * 1024):F1} MB";
            return $"{bytes / (1024.0 * 1024 * 1024):F1} GB";
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Visitor Pattern - File System Operations ===\n");

            try
            {
                // Build sample file system
                DirectoryNode root = BuildSampleFileSystem();

                Console.WriteLine("=== File System Structure Created ===\n");

                // Visit 1: Calculate sizes
                Console.WriteLine("=== Size Calculator Visitor ===\n");
                SizeCalculatorVisitor sizeCalc = new SizeCalculatorVisitor();
                root.Accept(sizeCalc);
                sizeCalc.PrintSummary();

                await Task.Delay(100);

                // Visit 2: Search for files
                Console.WriteLine("=== File Search Visitor (searching for 'data') ===\n");
                FileSearchVisitor searcher = new FileSearchVisitor("data", caseSensitive: false);
                root.Accept(searcher);
                searcher.PrintSummary();

                await Task.Delay(100);

                // Visit 3: Generate report
                Console.WriteLine("=== Report Generator Visitor ===\n");
                ReportGeneratorVisitor reporter = new ReportGeneratorVisitor();
                root.Accept(reporter);
                Console.WriteLine(reporter.GetReport());

                await Task.Delay(100);

                // Visit 4: Analyze compression
                Console.WriteLine("=== Compression Analyzer Visitor ===\n");
                CompressionAnalyzerVisitor compressor = new CompressionAnalyzerVisitor();
                root.Accept(compressor);
                compressor.PrintSummary();

                Console.WriteLine("=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }

        private static DirectoryNode BuildSampleFileSystem()
        {
            DirectoryNode root = new DirectoryNode("root", "/root");

            // Documents directory
            DirectoryNode documents = new DirectoryNode("Documents", "/root/Documents");
            documents.AddChild(new FileNode("report.txt", "/root/Documents/report.txt", 15000, ".txt", "text/plain"));
            documents.AddChild(new FileNode("data.csv", "/root/Documents/data.csv", 50000, ".csv", "text/csv"));
            documents.AddChild(new FileNode("presentation.pdf", "/root/Documents/presentation.pdf", 2500000, ".pdf", "application/pdf"));
            root.AddChild(documents);

            // Images directory
            DirectoryNode images = new DirectoryNode("Images", "/root/Images");
            images.AddChild(new FileNode("photo1.jpg", "/root/Images/photo1.jpg", 1500000, ".jpg", "image/jpeg"));
            images.AddChild(new FileNode("photo2.png", "/root/Images/photo2.png", 2000000, ".png", "image/png"));
            images.AddChild(new FileNode("diagram.svg", "/root/Images/diagram.svg", 50000, ".svg", "image/svg+xml"));
            root.AddChild(images);

            // Projects directory with subdirectory
            DirectoryNode projects = new DirectoryNode("Projects", "/root/Projects");

            DirectoryNode webProject = new DirectoryNode("WebApp", "/root/Projects/WebApp");
            webProject.AddChild(new FileNode("index.html", "/root/Projects/WebApp/index.html", 8000, ".html", "text/html"));
            webProject.AddChild(new FileNode("app.js", "/root/Projects/WebApp/app.js", 25000, ".js", "application/javascript"));
            webProject.AddChild(new FileNode("data.json", "/root/Projects/WebApp/data.json", 12000, ".json", "application/json"));
            projects.AddChild(webProject);

            root.AddChild(projects);

            // Logs directory
            DirectoryNode logs = new DirectoryNode("Logs", "/root/Logs");
            logs.AddChild(new FileNode("app.log", "/root/Logs/app.log", 150000, ".log", "text/plain"));
            logs.AddChild(new FileNode("error.log", "/root/Logs/error.log", 45000, ".log", "text/plain"));
            root.AddChild(logs);

            // Archives directory
            DirectoryNode archives = new DirectoryNode("Archives", "/root/Archives");
            archives.AddChild(new FileNode("backup.zip", "/root/Archives/backup.zip", 5000000, ".zip", "application/zip"));
            archives.AddChild(new FileNode("old_data.tar.gz", "/root/Archives/old_data.tar.gz", 3500000, ".gz", "application/gzip"));
            root.AddChild(archives);

            // Add a symbolic link
            root.AddChild(new SymbolicLinkNode("important_docs", "/root/important_docs", "/root/Documents"));

            return root;
        }
    }
}
