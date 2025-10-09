import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Concrete Decorator - adds Base64 encoding to the stream
 */
public class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public void write(byte[] data) throws IOException {
        // Encode data to Base64
        byte[] encodedData = Base64.getEncoder().encode(data);
        System.out.println("EncodingDecorator: Encoded " + data.length +
                " bytes to " + encodedData.length + " bytes (Base64)");

        decoratedCoffee.write(encodedData);
    }

    @Override
    public byte[] read() throws IOException {
        // Read encoded data
        byte[] encodedData = decoratedCoffee.read();

        // Decode from Base64
        byte[] decodedData = Base64.getDecoder().decode(encodedData);
        System.out.println("EncodingDecorator: Decoded " + encodedData.length +
                " bytes to " + decodedData.length + " bytes");

        return decodedData;
    }

    @Override
    public String getDescription() {
        return decoratedCoffee.getDescription() + " + Base64 Encoding";
    }
}
