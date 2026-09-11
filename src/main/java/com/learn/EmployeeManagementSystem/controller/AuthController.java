package com.learn.EmployeeManagementSystem.controller;

import com.learn.EmployeeManagementSystem.DTOs.auth.AuthResponse;
import com.learn.EmployeeManagementSystem.DTOs.auth.LoginRequest;
import com.learn.EmployeeManagementSystem.DTOs.auth.RegisterRequest;
import com.learn.EmployeeManagementSystem.entity.Role;
import com.learn.EmployeeManagementSystem.entity.User;
import com.learn.EmployeeManagementSystem.repository.UserRepository;
import com.learn.EmployeeManagementSystem.security.CustomUserDetails;
import com.learn.EmployeeManagementSystem.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String jwt = jwtUtils.generateToken(
                    userDetails.getUsername(),
                    userDetails.getRole(),
                    userDetails.getFullName()
            );

            AuthResponse response = AuthResponse.builder()
                    .token(jwt)
                    .type("Bearer")
                    .id(userDetails.getId())
                    .username(userDetails.getUsername())
                    .fullName(userDetails.getFullName())
                    .email(userDetails.getEmail())
                    .role(userDetails.getRole())
                    .build();

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password", "status", 401));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Authentication error: " + e.getMessage(), "status", 500));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }

        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            AuthResponse response = AuthResponse.builder()
                    .id(userDetails.getId())
                    .username(userDetails.getUsername())
                    .fullName(userDetails.getFullName())
                    .email(userDetails.getEmail())
                    .role(userDetails.getRole())
                    .build();
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unable to retrieve session profile"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists: " + registerRequest.getUsername()));
        }

        Role assignedRole = registerRequest.getRole() != null ? registerRequest.getRole() : Role.ROLE_EMPLOYEE;

        // If trying to register an ADMIN, verify current user is ADMIN (unless system is brand new)
        if (assignedRole == Role.ROLE_ADMIN && userRepository.count() > 0) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isCallerAdmin = authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals(Role.ROLE_ADMIN.name()));

            if (!isCallerAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Only existing administrators can provision new Admin accounts"));
            }
        }

        User newUser = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .role(assignedRole)
                .enabled(true)
                .build();

        User saved = userRepository.save(newUser);

        AuthResponse response = AuthResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
