/** Concrete Class */
public class JSONDataProcessor extends DataProcessor {

    @Override
    protected void readData() {
        System.out.println("Reading data from JSON file...");
    }

    @Override
    protected void processData() {
        System.out.println("Processing JSON data...");
    }

    @Override
    protected void writeData() {
        System.out.println("Writing data to JSON file...");
    }
}
