package officieInventory.officieInventory.service;


import officieInventory.officieInventory.dto.OrderRequest;
import officieInventory.officieInventory.dto.OrderResponse;
import officieInventory.officieInventory.model.Order;
import officieInventory.officieInventory.model.OrderItem;
import officieInventory.officieInventory.model.User;
import officieInventory.officieInventory.repository.OrderItemRepository;
import officieInventory.officieInventory.repository.OrderRepository;
import officieInventory.officieInventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Order createOrder(OrderRequest request, String username, String status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate: No duplicate items in same order
        long distinctItems = request.getItems().stream().map(OrderRequest.ItemDto::getItemName).distinct().count();
        if (distinctItems != request.getItems().size()) {
            throw new RuntimeException("Duplicate items not allowed in same order");
        }

        // If submitting, check no duplicate items across submitted orders
        if ("SUBMITTED".equals(status)) {
            for (OrderRequest.ItemDto item : request.getItems()) {
                if (orderRepository.existsByItemNameInSubmittedOrders(item.getItemName())) {
                    throw new RuntimeException("Item '" + item.getItemName() + "' already exists in another submitted order");
                }
            }
        }

        Order order = new Order();
        order.setStatus(status);
        order.setExpiryDate(request.getExpiryDate());
        order.setCreatedAt(LocalDateTime.now());
        order.setCreatedBy(user);

        order = orderRepository.save(order);

        for (OrderRequest.ItemDto itemDto : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setItemName(itemDto.getItemName());
            item.setQuantity(itemDto.getQuantity());
            item.setOrder(order);
            orderItemRepository.save(item);
        }

        return order;
    }

    @Transactional
    public Order updateOrder(Long orderId, OrderRequest request, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Only draft orders can be edited
        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("Only draft orders can be edited");
        }

        // Only creator can edit
        if (!order.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Only the creator can edit this order");
        }

        // Update items
        orderItemRepository.deleteByOrder(order);

        for (OrderRequest.ItemDto itemDto : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setItemName(itemDto.getItemName());
            item.setQuantity(itemDto.getQuantity());
            item.setOrder(order);
            orderItemRepository.save(item);
        }

        order.setExpiryDate(request.getExpiryDate());

        return orderRepository.save(order);
    }

    @Transactional
    public Order submitOrder(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("Only draft orders can be submitted");
        }

        if (!order.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Only the creator can submit this order");
        }

        // Check for duplicate items across submitted orders
        for (OrderItem item : order.getItems()) {
            if (orderRepository.existsByItemNameInSubmittedOrders(item.getItemName())) {
                throw new RuntimeException("Item '" + item.getItemName() + "' already exists in another submitted order");
            }
        }

        order.setStatus("SUBMITTED");
        return orderRepository.save(order);
    }

    @Transactional
    public Order completeOrder(Long orderId, String transactionReference) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"SUBMITTED".equals(order.getStatus())) {
            throw new RuntimeException("Only submitted orders can be completed");
        }

        order.setStatus("COMPLETED");
        order.setTransactionReference(transactionReference);
        return orderRepository.save(order);
    }

    @Transactional
    public Order rejectOrder(Long orderId, String note) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"SUBMITTED".equals(order.getStatus())) {
            throw new RuntimeException("Only submitted orders can be rejected");
        }

        order.setStatus("REJECTED");
        order.setRejectionNote(note);
        return orderRepository.save(order);
    }

    public List<OrderResponse> getOrdersByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> orders = orderRepository.findByCreatedBy(user);
        return orders.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getAllSubmittedOrders() {
        List<Order> orders = orderRepository.findByStatus("SUBMITTED");
        return orders.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToResponse(order);
    }

    private OrderResponse convertToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setStatus(order.getStatus());
        response.setExpiryDate(order.getExpiryDate());
        response.setCreatedAt(order.getCreatedAt());
        response.setTransactionReference(order.getTransactionReference());
        response.setRejectionNote(order.getRejectionNote());
        response.setCreatedByUsername(order.getCreatedBy().getUsername());

        List<OrderResponse.ItemDto> items = order.getItems().stream()
                .map(item -> new OrderResponse.ItemDto(item.getItemName(), item.getQuantity()))
                .collect(Collectors.toList());
        response.setItems(items);

        return response;
    }
}