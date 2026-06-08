package officieInventory.officieInventory.dto;

public class AuthRequest {
    private String username;
    private String password;
    private String fullName;

    // Constructors
    public AuthRequest() {}

    public AuthRequest(String username, String password, String fullName) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}