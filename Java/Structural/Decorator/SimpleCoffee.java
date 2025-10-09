import java.io.*;

/**
 * Concrete Component - basic file stream implementation
 */
public class SimpleCoffee implements Coffee {
    private String filePath;
    private FileOutputStream outputStream;
    private FileInputStream inputStream;

    public SimpleCoffee(String filePath) {
        this.filePath = filePath;
    }

    @Override
    public void write(byte[] data) throws IOException {
        if (outputStream == null) {
            outputStream = new FileOutputStream(filePath);
        }
        outputStream.write(data);
        outputStream.flush();
    }

    @Override
    public byte[] read() throws IOException {
        if (inputStream == null) {
            inputStream = new FileInputStream(filePath);
        }
        return inputStream.readAllBytes();
    }

    @Override
    public void close() throws IOException {
        if (outputStream != null) {
            outputStream.close();
        }
        if (inputStream != null) {
            inputStream.close();
        }
    }

    @Override
    public String getDescription() {
        return "Basic File Stream";
    }
}
