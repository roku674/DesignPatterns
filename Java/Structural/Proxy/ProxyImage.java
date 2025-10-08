/**
 * Proxy - controls access to RealSubject and provides lazy initialization
 */
public class ProxyImage implements Image {
    private String filename;
    private RealImage realImage;

    public ProxyImage(String filename) {
        this.filename = filename;
    }

    @Override
    public void display() {
        if (realImage == null) {
            System.out.println("ProxyImage: Creating real image on first access");
            realImage = new RealImage(filename);
        }
        realImage.display();
    }
}
