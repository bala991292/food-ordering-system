package com.foodorder.controller;

import com.foodorder.dto.Dtos.FoodRequest;
import com.foodorder.exception.ApiException;
import com.foodorder.model.Category;
import com.foodorder.model.FoodItem;
import com.foodorder.repository.CategoryRepository;
import com.foodorder.repository.FoodItemRepository;
import com.foodorder.repository.OrderItemRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/foods")
public class FoodController {
    private final FoodItemRepository foods;
    private final CategoryRepository categories;
    private final OrderItemRepository orderItems;

    public FoodController(FoodItemRepository foods, CategoryRepository categories, OrderItemRepository orderItems) {
        this.foods = foods;
        this.categories = categories;
        this.orderItems = orderItems;
    }

    @GetMapping
    public List<FoodItem> all() { return foods.findAll(); }

    @GetMapping("/{id}")
    public FoodItem one(@PathVariable Long id) {
        return foods.findById(id).orElseThrow(() -> ApiException.notFound("Food item"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FoodItem create(@Valid @RequestBody FoodRequest req) {
        return foods.save(apply(new FoodItem(), req));
    }

    @PutMapping("/{id}")
    public FoodItem update(@PathVariable Long id, @Valid @RequestBody FoodRequest req) {
        return foods.save(apply(one(id), req));
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        FoodItem f = one(id);
        if (orderItems.existsByFoodItemId(id)) {
            // keep order history intact: hide the item instead of deleting it
            f.setAvailable(false);
            foods.save(f);
            return Map.of("message", "Item is part of past orders, so it was marked unavailable instead of deleted");
        }
        foods.delete(f);
        return Map.of("message", "Item deleted");
    }

    private FoodItem apply(FoodItem f, FoodRequest r) {
        f.setName(r.name().trim());
        f.setDescription(r.description());
        f.setPrice(r.price());
        f.setImageUrl(r.imageUrl());
        f.setAvailable(r.available());
        Category c = null;
        if (r.categoryId() != null) {
            c = categories.findById(r.categoryId()).orElseThrow(() -> ApiException.notFound("Category"));
        }
        f.setCategory(c);
        return f;
    }
}
