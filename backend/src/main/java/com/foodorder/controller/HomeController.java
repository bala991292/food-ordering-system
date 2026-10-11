package com.foodorder.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {
    @GetMapping("/")
    public Map<String, String> home() { return Map.of("service", "Online Food Ordering API", "status", "running"); }
}
