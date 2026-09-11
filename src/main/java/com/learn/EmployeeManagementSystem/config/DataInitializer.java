package com.learn.EmployeeManagementSystem.config;

import com.learn.EmployeeManagementSystem.entity.Role;
import com.learn.EmployeeManagementSystem.entity.User;
import com.learn.EmployeeManagementSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Initialize default Admin if absent
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Amazon Administrator")
                    .email("admin@amazon.com")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info(">>> Security DataInitializer: Default Amazon Admin created (Username: 'admin', Password: 'admin123')");
        }

        // 2. Initialize default Employee user if absent
        if (!userRepository.existsByUsername("employee")) {
            User employee = User.builder()
                    .username("employee")
                    .password(passwordEncoder.encode("employee123"))
                    .fullName("Sarah Jenkins")
                    .email("sarah.jenkins@amazon.com")
                    .role(Role.ROLE_EMPLOYEE)
                    .enabled(true)
                    .build();
            userRepository.save(employee);
            log.info(">>> Security DataInitializer: Default Amazon Employee created (Username: 'employee', Password: 'employee123')");
        }
    }
}
