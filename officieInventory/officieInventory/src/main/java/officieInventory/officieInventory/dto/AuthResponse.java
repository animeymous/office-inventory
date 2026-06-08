package officieInventory.officieInventory.dto;

public class AuthResponse {
    private String token;
    private String role;
    private String username;
    private String fullName;

    public AuthResponse(String token, String role, String username, String fullName) {
        this.token = token;
        this.role = role;
        this.username = username;
        this.fullName = fullName;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}