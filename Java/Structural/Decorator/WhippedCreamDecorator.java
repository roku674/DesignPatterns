import java.io.IOException;
import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;

/**
 * Concrete Decorator - adds encryption to the stream
 */
public class WhippedCreamDecorator extends CoffeeDecorator {
    private static final String ALGORITHM = "AES";
    private static final byte[] KEY_VALUE = "MySecretKey12345".getBytes(); // 16 bytes for AES

    public WhippedCreamDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public void write(byte[] data) throws IOException {
        try {
            // Encrypt data
            Key key = new SecretKeySpec(KEY_VALUE, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encryptedData = cipher.doFinal(data);

            System.out.println("EncryptionDecorator: Encrypted " + data.length +
                    " bytes to " + encryptedData.length + " bytes (AES)");

            decoratedCoffee.write(encryptedData);
        } catch (Exception e) {
            throw new IOException("Encryption failed", e);
        }
    }

    @Override
    public byte[] read() throws IOException {
        try {
            // Read encrypted data
            byte[] encryptedData = decoratedCoffee.read();

            // Decrypt
            Key key = new SecretKeySpec(KEY_VALUE, ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decryptedData = cipher.doFinal(encryptedData);

            System.out.println("EncryptionDecorator: Decrypted " + encryptedData.length +
                    " bytes to " + decryptedData.length + " bytes");

            return decryptedData;
        } catch (Exception e) {
            throw new IOException("Decryption failed", e);
        }
    }

    @Override
    public String getDescription() {
        return decoratedCoffee.getDescription() + " + AES Encryption";
    }
}
