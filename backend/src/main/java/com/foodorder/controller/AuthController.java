package com.foodorder.controller;

import com.foodorder.dto.Dtos.*;
import com.foodorder.exception.ApiException;
import com.foodorder.model.Role;
import com.foodorder.model.User;
import com.foodorder.repository.UserRepository;
import com.foodorder.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtUtil jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw ApiException.badRequest("An account with this email already exists");
        User u = new User();
        u.setName(req.name().trim());
        u.setEmail(email);
        u.setPassword(encoder.encode(req.password()));
        u.setPhone(req.phone());
        u.setAddress(req.address());
        u.setRole(Role.CUSTOMER);
        return toAuth(users.save(u));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User u = users.findByEmail(req.email().trim().toLowerCase())
                .filter(x -> encoder.matches(req.password(), x.getPassword()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));
        return toAuth(u);
    }

    private AuthResponse toAuth(User u) {
        return new AuthResponse(jwt.generate(u), u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }
}
