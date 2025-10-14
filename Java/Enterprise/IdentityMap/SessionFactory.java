package Enterprise.IdentityMap;
public class SessionFactory {
    public Session openSession() {
        return new Session();
    }
}
