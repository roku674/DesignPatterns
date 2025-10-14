package Microservices.ClientSideUIComposition;
public class MicroFrontend {
    private String name;
    private String scriptUrl;
    
    public MicroFrontend(String name, String scriptUrl) {
        this.name = name;
        this.scriptUrl = scriptUrl;
    }
    
    public void render() {
        System.out.println("  Rendering " + name + " from " + scriptUrl);
    }
    
    public String getName() { return name; }
}
