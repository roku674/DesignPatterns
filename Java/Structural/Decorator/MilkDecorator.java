import java.io.*;
import java.util.zip.*;

/**
 * Concrete Decorator - adds compression to the stream
 */
public class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public void write(byte[] data) throws IOException {
        // Compress data before writing
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        GZIPOutputStream gzipOut = new GZIPOutputStream(baos);
        gzipOut.write(data);
        gzipOut.close();

        byte[] compressedData = baos.toByteArray();
        System.out.println("CompressionDecorator: Compressed " + data.length +
                " bytes to " + compressedData.length + " bytes");

        decoratedCoffee.write(compressedData);
    }

    @Override
    public byte[] read() throws IOException {
        // Read compressed data
        byte[] compressedData = decoratedCoffee.read();

        // Decompress
        ByteArrayInputStream bais = new ByteArrayInputStream(compressedData);
        GZIPInputStream gzipIn = new GZIPInputStream(bais);
        byte[] decompressedData = gzipIn.readAllBytes();
        gzipIn.close();

        System.out.println("CompressionDecorator: Decompressed " + compressedData.length +
                " bytes to " + decompressedData.length + " bytes");

        return decompressedData;
    }

    @Override
    public String getDescription() {
        return decoratedCoffee.getDescription() + " + Compression";
    }
}
