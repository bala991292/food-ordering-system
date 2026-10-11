package com.foodorder.dto;

import com.foodorder.model.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class Dtos {
    private Dtos() {}

    public record RegisterRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String password,
            String phone,
            String address) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(String token, Long id, String name, String email, String role) {}

    public record CategoryRequest(@NotBlank String name) {}

    public record FoodRequest(
            @NotBlank String name,
            String description,
            @NotNull @Positive BigDecimal price,
            String imageUrl,
            boolean available,
            Long categoryId) {}

    public record OrderLine(@NotNull Long foodId, @Min(1) int quantity) {}

    public record OrderRequest(
            @NotBlank String customerName,
            @NotBlank String phone,
            @NotBlank String address,
            @NotEmpty List<@Valid OrderLine> items) {}

    public record StatusRequest(@NotNull OrderStatus status) {}

    public record OrderItemResponse(Long foodId, String foodName, int quantity, BigDecimal unitPrice) {}

    public record OrderResponse(
            Long id, String customerEmail, String customerName, String phone, String address,
            BigDecimal totalPrice, OrderStatus status, LocalDateTime createdAt,
            List<OrderItemResponse> items) {}
}
