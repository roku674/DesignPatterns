import java.io.IOException;

/**
 * Base Decorator - maintains reference to component and defines interface
 */
public abstract class CoffeeDecorator implements Coffee {
    protected Coffee decoratedCoffee;

    public CoffeeDecorator(Coffee coffee) {
        this.decoratedCoffee = coffee;
    }

    @Override
    public void write(byte[] data) throws IOException {
        decoratedCoffee.write(data);
    }

    @Override
    public byte[] read() throws IOException {
        return decoratedCoffee.read();
    }

    @Override
    public void close() throws IOException {
        decoratedCoffee.close();
    }

    @Override
    public String getDescription() {
        return decoratedCoffee.getDescription();
    }
}
