using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Text;

namespace Decorator;

/// <summary>
/// Concrete decorator that adds encryption functionality using AES.
/// This is REAL encryption using System.Security.Cryptography.
/// </summary>
public class EncryptionDecorator : StreamDecorator
{
    private readonly byte[] _key;
    private readonly byte[] _iv;

    public EncryptionDecorator(IDataStream wrappedStream, string password) : base(wrappedStream)
    {
        // Derive key and IV from password using PBKDF2
        using Rfc2898DeriveBytes derive = new Rfc2898DeriveBytes(password, Encoding.UTF8.GetBytes("SaltValue"), 10000);
        _key = derive.GetBytes(32); // 256-bit key for AES-256
        _iv = derive.GetBytes(16);  // 128-bit IV
    }

    public override async Task WriteAsync(string data)
    {
        byte[] encryptedBytes = await EncryptAsync(data);
        Console.WriteLine($"[Encryption] Encrypted {data.Length} characters to {encryptedBytes.Length} bytes");

        string encryptedBase64 = Convert.ToBase64String(encryptedBytes);
        await _wrappedStream.WriteAsync(encryptedBase64);
    }

    public override async Task<string> ReadAsync()
    {
        string encryptedBase64 = await _wrappedStream.ReadAsync();

        if (string.IsNullOrEmpty(encryptedBase64))
        {
            return string.Empty;
        }

        byte[] encryptedBytes = Convert.FromBase64String(encryptedBase64);
        string decryptedData = await DecryptAsync(encryptedBytes);

        Console.WriteLine($"[Encryption] Decrypted {encryptedBytes.Length} bytes to {decryptedData.Length} characters");

        return decryptedData;
    }

    public override string GetStreamInfo()
    {
        return $"Encrypted({_wrappedStream.GetStreamInfo()})";
    }

    private async Task<byte[]> EncryptAsync(string plainText)
    {
        using Aes aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;

        ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

        using System.IO.MemoryStream msEncrypt = new System.IO.MemoryStream();
        using CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write);
        using (System.IO.StreamWriter swEncrypt = new System.IO.StreamWriter(csEncrypt))
        {
            await swEncrypt.WriteAsync(plainText);
        }

        return msEncrypt.ToArray();
    }

    private async Task<string> DecryptAsync(byte[] cipherText)
    {
        using Aes aes = Aes.Create();
        aes.Key = _key;
        aes.IV = _iv;

        ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

        using System.IO.MemoryStream msDecrypt = new System.IO.MemoryStream(cipherText);
        using CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
        using System.IO.StreamReader srDecrypt = new System.IO.StreamReader(csDecrypt);
        return await srDecrypt.ReadToEndAsync();
    }
}
