package Microservices.AccessToken;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Access Token Pattern ===\n");
        TokenService tokenService = new TokenService();
        String token = tokenService.generateToken("user123", new String[]{"read", "write"});
        System.out.println("Generated token: " + token);
        tokenService.validateToken(token);
        tokenService.extractPermissions(token);
    }
}
