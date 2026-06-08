package officieInventory.officieInventory.controller;

import officieInventory.officieInventory.dto.AuthRequest;
import officieInventory.officieInventory.dto.AuthResponse;
import officieInventory.officieInventory.model.User;
import officieInventory.officieInventory.security.JwtUtil;
import officieInventory.officieInventory.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        User user = userService.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!userService.validatePassword(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(new AuthResponse(token, user.getRole(), user.getUsername(), user.getFullName()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        // For initial setup - only creator role by default
        User user = userService.register(request.getUsername(), request.getPassword(), "CREATOR", request.getUsername());
        return ResponseEntity.ok(Map.of("message", "User registered successfully", "username", user.getUsername()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> request) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        userService.changePassword(username, request.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/create-purchaser")
    public ResponseEntity<?> createPurchaser(@RequestBody AuthRequest request) {

        // Check if username already exists
        if (userService.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        // Create new purchaser account
        User purchaser = userService.register(
                request.getUsername(),
                request.getPassword(),
                "PURCHASER",
                request.getFullName() != null ? request.getFullName() : request.getUsername()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Purchaser created successfully",
                "username", purchaser.getUsername(),
                "role", purchaser.getRole()
        ));
    }
}