package Microservices.ServerSidePageFragmentComposition;
public class FragmentService {
    private String name;
    private String htmlFragment;
    
    public FragmentService(String name, String htmlFragment) {
        this.name = name;
        this.htmlFragment = htmlFragment;
    }
    
    public String renderFragment() {
        System.out.println("Fetching fragment from " + name + " service");
        return htmlFragment;
    }
    
    public String getName() { return name; }
}
