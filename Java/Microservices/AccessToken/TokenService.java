package Microservices.AccessToken;
import java.util.*;
public class TokenService {
    private Map<String, TokenData> tokens = new HashMap<>();
    public String generateToken(String userId, String[] permissions) {
        String token = "TOKEN_" + UUID.randomUUID().toString().substring(0, 8);
        tokens.put(token, new TokenData(userId, permissions, System.currentTimeMillis() + 3600000));
        System.out.println("Token generated for user: " + userId);
        return token;
    }
    public boolean validateToken(String token) {
        TokenData data = tokens.get(token);
        if (data == null) {
            System.out.println("Token invalid");
            return false;
        }
        if (System.currentTimeMillis() > data.expiry) {
            System.out.println("Token expired");
            return false;
        }
        System.out.println("Token valid for user: " + data.userId);
        return true;
    }
    public void extractPermissions(String token) {
        TokenData data = tokens.get(token);
        if (data != null) {
            System.out.println("Permissions: " + Arrays.toString(data.permissions));
        }
    }
}
class TokenData {
    String userId;
    String[] permissions;
    long expiry;
    TokenData(String userId, String[] permissions, long expiry) {
        this.userId = userId;
        this.permissions = permissions;
        this.expiry = expiry;
    }
}
