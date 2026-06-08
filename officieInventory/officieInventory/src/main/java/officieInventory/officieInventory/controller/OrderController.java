package officieInventory.officieInventory.controller;

import officieInventory.officieInventory.dto.CompleteRequest;
import officieInventory.officieInventory.dto.OrderRequest;
import officieInventory.officieInventory.dto.OrderResponse;
import officieInventory.officieInventory.dto.RejectRequest;
import officieInventory.officieInventory.security.JwtUtil;
import officieInventory.officieInventory.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractUsername(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUsername(token);
    }

    private String extractRole(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractRole(token);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestHeader("Authorization") String authHeader, @RequestBody OrderRequest request) {
        String username = extractUsername(authHeader);
        String status = request.getStatus() != null ? request.getStatus() : "DRAFT";

        if (!"DRAFT".equals(status) && !"SUBMITTED".equals(status)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
        }

        try {
            var order = orderService.createOrder(request, username, status);
            return ResponseEntity.ok(Map.of("message", "Order created successfully", "orderId", order.getId(), "status", order.getStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<?> updateOrder(@RequestHeader("Authorization") String authHeader,
                                         @PathVariable Long orderId,
                                         @RequestBody OrderRequest request) {
        String username = extractUsername(authHeader);

        try {
            var order = orderService.updateOrder(orderId, request, username);
            return ResponseEntity.ok(Map.of("message", "Order updated successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/submit")
    public ResponseEntity<?> submitOrder(@RequestHeader("Authorization") String authHeader, @PathVariable Long orderId) {
        String username = extractUsername(authHeader);

        try {
            var order = orderService.submitOrder(orderId, username);
            return ResponseEntity.ok(Map.of("message", "Order submitted successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/complete")
    public ResponseEntity<?> completeOrder(@RequestHeader("Authorization") String authHeader,
                                           @PathVariable Long orderId,
                                           @RequestBody CompleteRequest request) {
        String role = extractRole(authHeader);

        if (!"PURCHASER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can complete orders"));
        }

        try {
            var order = orderService.completeOrder(orderId, request.getTransactionReference());
            return ResponseEntity.ok(Map.of("message", "Order completed successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/reject")
    public ResponseEntity<?> rejectOrder(@RequestHeader("Authorization") String authHeader,
                                         @PathVariable Long orderId,
                                         @RequestBody RejectRequest request) {
        String role = extractRole(authHeader);

        if (!"PURCHASER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can reject orders"));
        }

        try {
            var order = orderService.rejectOrder(orderId, request.getNote());
            return ResponseEntity.ok(Map.of("message", "Order rejected successfully", "orderId", order.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@RequestHeader("Authorization") String authHeader) {
        String username = extractUsername(authHeader);
        List<OrderResponse> orders = orderService.getOrdersByUser(username);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/submitted")
    public ResponseEntity<?> getSubmittedOrders(@RequestHeader("Authorization") String authHeader) {
        String role = extractRole(authHeader);

        if (!"PURCHASER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can view all submitted orders"));
        }

        List<OrderResponse> orders = orderService.getAllSubmittedOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(@RequestHeader("Authorization") String authHeader) {
        String role = extractRole(authHeader);

        if (!"PURCHASER".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only purchasers can view all orders"));
        }

        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@RequestHeader("Authorization") String authHeader, @PathVariable Long orderId) {
        String username = extractUsername(authHeader);
        String role = extractRole(authHeader);

        try {
            OrderResponse order = orderService.getOrderById(orderId);

            // Check permission: creator can view own orders, purchaser can view all
            if (!"PURCHASER".equals(role) && !order.getCreatedByUsername().equals(username)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}