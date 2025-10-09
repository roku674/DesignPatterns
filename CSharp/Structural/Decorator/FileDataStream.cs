using System.IO;
using System.Threading.Tasks;
using System.Text;

namespace Decorator;

/// <summary>
/// Concrete component - basic file stream implementation.
/// This is the core functionality that decorators will enhance.
/// </summary>
public class FileDataStream : IDataStream
{
    private readonly string _filePath;
    private FileStream? _fileStream;
    private StreamWriter? _writer;
    private StreamReader? _reader;

    public FileDataStream(string filePath)
    {
        _filePath = filePath ?? throw new ArgumentNullException(nameof(filePath));
    }

    public async Task WriteAsync(string data)
    {
        if (_writer == null)
        {
            _fileStream = new FileStream(_filePath, FileMode.Create, FileAccess.Write, FileShare.None);
            _writer = new StreamWriter(_fileStream, Encoding.UTF8);
        }

        await _writer.WriteAsync(data);
        Console.WriteLine($"[FileStream] Wrote {data.Length} characters to file");
    }

    public async Task<string> ReadAsync()
    {
        if (_reader == null)
        {
            if (!File.Exists(_filePath))
            {
                return string.Empty;
            }

            _fileStream = new FileStream(_filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            _reader = new StreamReader(_fileStream, Encoding.UTF8);
        }

        string content = await _reader.ReadToEndAsync();
        Console.WriteLine($"[FileStream] Read {content.Length} characters from file");
        return content;
    }

    public async Task FlushAsync()
    {
        if (_writer != null)
        {
            await _writer.FlushAsync();
            Console.WriteLine("[FileStream] Flushed to disk");
        }
    }

    public async Task CloseAsync()
    {
        if (_writer != null)
        {
            await _writer.DisposeAsync();
            _writer = null;
        }

        if (_reader != null)
        {
            _reader.Dispose();
            _reader = null;
        }

        if (_fileStream != null)
        {
            await _fileStream.DisposeAsync();
            _fileStream = null;
        }

        Console.WriteLine("[FileStream] Closed");
    }

    public long GetSize()
    {
        if (File.Exists(_filePath))
        {
            FileInfo fileInfo = new FileInfo(_filePath);
            return fileInfo.Length;
        }
        return 0;
    }

    public string GetStreamInfo()
    {
        return $"FileStream({_filePath})";
    }
}
