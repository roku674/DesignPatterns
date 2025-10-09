using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using System.Text;

namespace Decorator;

/// <summary>
/// Concrete decorator that adds compression functionality using GZip.
/// This is REAL compression using System.IO.Compression.
/// </summary>
public class CompressionDecorator : StreamDecorator
{
    public CompressionDecorator(IDataStream wrappedStream) : base(wrappedStream)
    {
    }

    public override async Task WriteAsync(string data)
    {
        byte[] originalBytes = Encoding.UTF8.GetBytes(data);
        byte[] compressedBytes = await CompressAsync(originalBytes);

        double compressionRatio = (1.0 - ((double)compressedBytes.Length / originalBytes.Length)) * 100;
        Console.WriteLine($"[Compression] Compressed {originalBytes.Length} bytes to {compressedBytes.Length} bytes ({compressionRatio:F2}% reduction)");

        string compressedBase64 = Convert.ToBase64String(compressedBytes);
        await _wrappedStream.WriteAsync(compressedBase64);
    }

    public override async Task<string> ReadAsync()
    {
        string compressedBase64 = await _wrappedStream.ReadAsync();

        if (string.IsNullOrEmpty(compressedBase64))
        {
            return string.Empty;
        }

        byte[] compressedBytes = Convert.FromBase64String(compressedBase64);
        byte[] decompressedBytes = await DecompressAsync(compressedBytes);

        Console.WriteLine($"[Compression] Decompressed {compressedBytes.Length} bytes to {decompressedBytes.Length} bytes");

        return Encoding.UTF8.GetString(decompressedBytes);
    }

    public override string GetStreamInfo()
    {
        return $"Compressed({_wrappedStream.GetStreamInfo()})";
    }

    private async Task<byte[]> CompressAsync(byte[] data)
    {
        using MemoryStream output = new MemoryStream();
        using (GZipStream gzip = new GZipStream(output, CompressionMode.Compress))
        {
            await gzip.WriteAsync(data, 0, data.Length);
        }
        return output.ToArray();
    }

    private async Task<byte[]> DecompressAsync(byte[] data)
    {
        using MemoryStream input = new MemoryStream(data);
        using MemoryStream output = new MemoryStream();
        using (GZipStream gzip = new GZipStream(input, CompressionMode.Decompress))
        {
            await gzip.CopyToAsync(output);
        }
        return output.ToArray();
    }
}
