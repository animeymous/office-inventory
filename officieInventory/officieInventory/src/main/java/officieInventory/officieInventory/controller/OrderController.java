package officieInventory.officieInventory.controller;

import officieInventory.officieInventory.dto.CompleteRequest;
import officieInventory.officieInventory.dto.OrderRequest;
import officieInventory.officieInventory.dto.OrderResponse;
import officieInventory.officieInventory.dto.RejectRequest;
import officieInventory.officieInventory.security.JwtUtil;
import officieInventory.officieInventory.service.OrderService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractToken(HttpServletRequest request) {
        // Try to get from cookie first
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    System.out.println("Token found in cookie");
                    return cookie.getValue();
                }
            }
        }

        // If not in cookie, try Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            System.out.println("Token found in Authorization header");
            return authHeader.substring(7);
        }

        System.out.println("No token found in request");
        return null;
    }

    private String extractUsername(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            throw new RuntimeException("No authentication token found");
        }
        return jwtUtil.extractUsername(token);
    }

    private String extractRole(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            throw new RuntimeException("No authentication token found");
        }
        return jwtUtil.extractRole(token);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(HttpServletRequest request, @RequestBody OrderRequest orderRequest) {
        try {
            String username = extractUsername(request);
            System.out.println("Creating order for user: " + username);

            String status = orderRequest.getStatus() != null ? orderRequest.getStatus() : "DRAFT";

            if (!"DRAFT".equals(status) && !"SUBMITTED".equals(status)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
            }

            var order = orderService.createOrder(orderRequest, username, status);
            return ResponseEntity.ok(Map.of("message", "Order created successfully", "orderId", order.getId(), "status", order.getStatus()));
        } catch (RuntimeException e) {
            System.out.println("Error creating order: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<?> updateOrder(HttpServletRequest request,
                                         @PathVariable Long orderId,
                                         @RequestBody OrderRequest orderRequest) {
        try {
            String username = extractUsername(request);
            var order = orderService.updateOrder(orderId, orderRequest, username);
            return ResponseEntity.ok(Map.of("message", "Order updated successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/submit")
    public ResponseEntity<?> submitOrder(HttpServletRequest request, @PathVariable Long orderId) {
        try {
            String username = extractUsername(request);
            var order = orderService.submitOrder(orderId, username);
            return ResponseEntity.ok(Map.of("message", "Order submitted successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/complete")
    public ResponseEntity<?> completeOrder(HttpServletRequest request,
                                           @PathVariable Long orderId,
                                           @RequestBody CompleteRequest completeRequest) {
        try {
            String role = extractRole(request);

            if (!"PURCHASER".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can complete orders"));
            }

            var order = orderService.completeOrder(orderId, completeRequest.getTransactionReference());
            return ResponseEntity.ok(Map.of("message", "Order completed successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/reject")
    public ResponseEntity<?> rejectOrder(HttpServletRequest request,
                                         @PathVariable Long orderId,
                                         @RequestBody RejectRequest rejectRequest) {
        try {
            String role = extractRole(request);

            if (!"PURCHASER".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can reject orders"));
            }

            var order = orderService.rejectOrder(orderId, rejectRequest.getNote());
            return ResponseEntity.ok(Map.of("message", "Order rejected successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(HttpServletRequest request) {
        try {
            String username = extractUsername(request);
            System.out.println("Fetching orders for user: " + username);
            List<OrderResponse> orders = orderService.getOrdersByUser(username);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            System.out.println("Error fetching orders: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/submitted")
    public ResponseEntity<?> getSubmittedOrders(HttpServletRequest request) {
        try {
            String role = extractRole(request);

            if (!"PURCHASER".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can view all submitted orders"));
            }

            List<OrderResponse> orders = orderService.getAllSubmittedOrders();
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(HttpServletRequest request) {
        try {
            String role = extractRole(request);

            if (!"PURCHASER".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can view all orders"));
            }

            List<OrderResponse> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(HttpServletRequest request, @PathVariable Long orderId) {
        try {
            String username = extractUsername(request);
            String role = extractRole(request);

            OrderResponse order = orderService.getOrderById(orderId);

            if (!"PURCHASER".equals(role) && !order.getCreatedByUsername().equals(username)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all-for-purchaser")
    public ResponseEntity<?> getAllOrdersForPurchaser(HttpServletRequest request) {
        try {
            String role = extractRole(request);

            if (!"PURCHASER".equals(role)) {
                return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can view all orders"));
            }

            List<OrderResponse> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}