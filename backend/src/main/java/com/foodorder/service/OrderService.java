package com.foodorder.service;

import com.foodorder.dto.Dtos.*;
import com.foodorder.exception.ApiException;
import com.foodorder.model.*;
import com.foodorder.repository.FoodItemRepository;
import com.foodorder.repository.OrderRepository;
import com.foodorder.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orders;
    private final FoodItemRepository foods;
    private final UserRepository users;

    public OrderService(OrderRepository orders, FoodItemRepository foods, UserRepository users) {
        this.orders = orders;
        this.foods = foods;
        this.users = users;
    }

    @Transactional
    public OrderResponse place(String email, OrderRequest req) {
        User user = users.findByEmail(email).orElseThrow(() -> ApiException.notFound("User"));
        Order order = new Order();
        order.setUser(user);
        order.setCustomerName(req.customerName().trim());
        order.setPhone(req.phone().trim());
        order.setAddress(req.address().trim());

        BigDecimal total = BigDecimal.ZERO;
        for (OrderLine line : req.items()) {
            FoodItem food = foods.findById(line.foodId())
                    .orElseThrow(() -> ApiException.notFound("Food item " + line.foodId()));
            if (!food.isAvailable()) {
                throw ApiException.badRequest(food.getName() + " is currently unavailable");
            }
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setFoodItem(food);
            item.setFoodName(food.getName());
            item.setQuantity(line.quantity());
            item.setUnitPrice(food.getPrice());
            order.getItems().add(item);
            total = total.add(food.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }
        order.setTotalPrice(total);
        return toResponse(orders.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> ApiException.notFound("User"));
        return orders.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> allOrders() {
        return orders.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orders.findById(id).orElseThrow(() -> ApiException.notFound("Order"));
        order.setStatus(status);
        return toResponse(order);
    }

    private OrderResponse toResponse(Order o) {
        return new OrderResponse(
                o.getId(), o.getUser().getEmail(), o.getCustomerName(), o.getPhone(), o.getAddress(),
                o.getTotalPrice(), o.getStatus(), o.getCreatedAt(),
                o.getItems().stream().map(i -> new OrderItemResponse(
                        i.getFoodItem() == null ? null : i.getFoodItem().getId(),
                        i.getFoodName(), i.getQuantity(), i.getUnitPrice())).toList());
    }
}
