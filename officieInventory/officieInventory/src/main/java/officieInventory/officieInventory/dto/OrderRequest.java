package officieInventory.officieInventory.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OrderRequest {
    private List<ItemDto> items;
    private LocalDateTime expiryDate;
    private String status; // DRAFT or SUBMITTED

    public static class ItemDto {
        private String itemName;
        private Integer quantity;

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public List<ItemDto> getItems() { return items; }
    public void setItems(List<ItemDto> items) { this.items = items; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}