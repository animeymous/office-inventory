package officieInventory.officieInventory.repository;

import officieInventory.officieInventory.model.Order;
import officieInventory.officieInventory.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCreatedBy(User createdBy);
    List<Order> findByStatus(String status);

    @Query("SELECT DISTINCT o.itemName FROM OrderItem o WHERE o.order.status = 'SUBMITTED'")
    List<String> findAllSubmittedItemNames();

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM OrderItem o WHERE o.itemName = :itemName AND o.order.status = 'SUBMITTED'")
    boolean existsByItemNameInSubmittedOrders(@Param("itemName") String itemName);
}
