package officieInventory.officieInventory.repository;

import officieInventory.officieInventory.model.OrderItem;
import officieInventory.officieInventory.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
    void deleteByOrder(Order order);
}
