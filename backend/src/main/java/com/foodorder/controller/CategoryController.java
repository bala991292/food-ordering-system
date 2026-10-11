package com.foodorder.controller;

import com.foodorder.dto.Dtos.CategoryRequest;
import com.foodorder.exception.ApiException;
import com.foodorder.model.Category;
import com.foodorder.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryRepository repo;

    public CategoryController(CategoryRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Category> all() { return repo.findAll(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@Valid @RequestBody CategoryRequest req) {
        if (repo.existsByNameIgnoreCase(req.name().trim())) throw ApiException.badRequest("Category already exists");
        return repo.save(new Category(req.name().trim()));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if (!repo.existsById(id)) throw ApiException.notFound("Category");
        try {
            repo.deleteById(id);
            repo.flush();
        } catch (DataIntegrityViolationException e) {
            throw ApiException.badRequest("This category still has food items. Move or delete them first.");
        }
    }
}
