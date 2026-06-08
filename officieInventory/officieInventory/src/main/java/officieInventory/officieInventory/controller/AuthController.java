package officieInventory.officieInventory.controller;

import officieInventory.officieInventory.dto.AuthRequest;
import officieInventory.officieInventory.dto.AuthResponse;
import officieInventory.officieInventory.model.User;
import officieInventory.officieInventory.security.JwtUtil;
import officieInventory.officieInventory.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        User user = userService.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!userService.validatePassword(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(8 * 60 * 60);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);

        return ResponseEntity.ok(new AuthResponse(null, user.getRole(), user.getUsername(), user.getFullName()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        User user = userService.register(
                request.getUsername(),
                request.getPassword(),
                "CREATOR",
                request.getFullName() != null ? request.getFullName() : request.getUsername()
        );
        return ResponseEntity.ok(Map.of("message", "User registered successfully", "username", user.getUsername()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(HttpServletRequest request, @RequestBody Map<String, String> passwordRequest) {
        String token = extractToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No authentication token found"));
        }
        String username = jwtUtil.extractUsername(token);

        String newPassword = passwordRequest.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        userService.changePassword(username, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/create-purchaser")
    public ResponseEntity<?> createPurchaser(@RequestBody AuthRequest request,
                                             @RequestHeader(value = "X-Admin-Secret", required = false) String secret) {

        String ADMIN_SECRET = "reviewer123";

        // Check admin secret
        if (secret == null || !secret.equals(ADMIN_SECRET)) {
            return ResponseEntity.status(403).body(Map.of(
                    "error", "Invalid or missing admin secret",
                    "message", "This API is for internal use only. Please provide valid X-Admin-Secret header."
            ));
        }

        // Validate request
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        // Check if username already exists
        if (userService.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Username already exists",
                    "username", request.getUsername()
            ));
        }

        try {
            // Create new purchaser account
            User purchaser = userService.register(
                    request.getUsername(),
                    request.getPassword(),
                    "PURCHASER",
                    request.getFullName() != null && !request.getFullName().trim().isEmpty()
                            ? request.getFullName()
                            : request.getUsername()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Purchaser created successfully",
                    "username", purchaser.getUsername(),
                    "role", purchaser.getRole(),
                    "fullName", purchaser.getFullName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to create purchaser",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false, "message", "No token found"));
        }

        boolean isValid = jwtUtil.isTokenValid(token);
        if (isValid) {
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "username", username,
                    "role", role
            ));
        } else {
            return ResponseEntity.status(401).body(Map.of("authenticated", false, "message", "Invalid or expired token"));
        }
    }
}