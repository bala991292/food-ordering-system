package com.foodorder.config;

import com.foodorder.model.*;
import com.foodorder.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final CategoryRepository categories;
    private final FoodItemRepository foods;
    private final PasswordEncoder encoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(UserRepository users, CategoryRepository categories, FoodItemRepository foods,
                      PasswordEncoder encoder,
                      @Value("${app.admin.email}") String adminEmail,
                      @Value("${app.admin.password}") String adminPassword) {
        this.users = users;
        this.categories = categories;
        this.foods = foods;
        this.encoder = encoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (!users.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setName("Administrator");
            admin.setEmail(adminEmail);
            admin.setPassword(encoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            users.save(admin);
        }
        if (categories.count() == 0) {
            Category mains = categories.save(new Category("Mains"));
            Category pizza = categories.save(new Category("Pizza"));
            Category snacks = categories.save(new Category("Snacks"));
            Category drinks = categories.save(new Category("Drinks"));
            Category desserts = categories.save(new Category("Desserts"));
            add("Butter Chicken", "Tender chicken in a creamy tomato gravy", "280", mains);
            add("Paneer Tikka Masala", "Grilled paneer in spiced masala", "240", mains);
            add("Veg Biryani", "Fragrant basmati rice with vegetables and raita", "190", mains);
            add("Margherita Pizza", "Mozzarella, tomato and basil", "260", pizza);
            add("Farmhouse Pizza", "Capsicum, onion, mushroom and corn", "320", pizza);
            add("Crispy Samosa (2 pcs)", "Potato and pea filling, served with chutney", "50", snacks);
            add("French Fries", "Salted and crisp", "90", snacks);
            add("Masala Chai", "Ginger and cardamom tea", "30", drinks);
            add("Fresh Lime Soda", "Sweet or salted", "60", drinks);
            add("Gulab Jamun (2 pcs)", "Warm milk dumplings in sugar syrup", "70", desserts);
        }
    }

    private void add(String name, String desc, String price, Category cat) {
        FoodItem f = new FoodItem();
        f.setName(name);
        f.setDescription(desc);
        f.setPrice(new BigDecimal(price));
        f.setAvailable(true);
        f.setCategory(cat);
        foods.save(f);
    }
}
