package officieInventory.officieInventory.controller;

import officieInventory.officieInventory.model.User;
import officieInventory.officieInventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default CREATOR
        if (!userRepository.existsByUsername("creator1")) {
            User creator = new User();
            creator.setUsername("creator1");
            creator.setPassword(passwordEncoder.encode("password123"));
            creator.setRole("CREATOR");
            creator.setFullName("Office Admin");
            userRepository.save(creator);
            System.out.println("Default CREATOR created: creator1 / password123");
        }

        // Create default PURCHASER
        if (!userRepository.existsByUsername("purchaser1")) {
            User purchaser = new User();
            purchaser.setUsername("purchaser1");
            purchaser.setPassword(passwordEncoder.encode("password123"));
            purchaser.setRole("PURCHASER");
            purchaser.setFullName("Purchasing Manager");
            userRepository.save(purchaser);
            System.out.println("Default PURCHASER created: purchaser1 / password123");
        }
    }
}
