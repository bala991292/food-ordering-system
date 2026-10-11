package com.foodorder.controller;

import com.foodorder.dto.Dtos.*;
import com.foodorder.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse place(Authentication auth, @Valid @RequestBody OrderRequest req) {
        return service.place(auth.getName(), req);
    }

    @GetMapping("/api/orders/my")
    public List<OrderResponse> mine(Authentication auth) { return service.myOrders(auth.getName()); }

    @GetMapping("/api/admin/orders")
    public List<OrderResponse> all() { return service.allOrders(); }

    @PutMapping("/api/admin/orders/{id}/status")
    public OrderResponse status(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        return service.updateStatus(id, req.status());
    }
}
