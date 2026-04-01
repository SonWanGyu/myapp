package com.example.app.controller;

import com.example.app.domain.User;
import com.example.app.repository.UserRepository;
import com.example.app.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(""));
        return users;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if ("thsdhksrb@gmail.com".equalsIgnoreCase(user.getEmail())) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setPasswordUpdatedAt(LocalDateTime.now());
        user.setPasswordPromptStatus("DEFAULT");
        return userRepository.save(user);
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser, HttpServletResponse response) {
        return userRepository.findByEmail(loginUser.getEmail())
                .filter(u -> !"DELETED".equals(u.getStatus()))
                .map(user -> {
                    if (passwordEncoder.matches(loginUser.getPassword(), user.getPassword())) {
                        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getName());
                        Cookie cookie = new Cookie("jwt", token);
                        cookie.setHttpOnly(true);
                        cookie.setPath("/");
                        cookie.setMaxAge(86400); // 1 day
                        response.addCookie(cookie);
                        
                        user.setPassword("");
                        return ResponseEntity.ok(user);
                    } else {
                        return ResponseEntity.status(401).body("Invalid password");
                    }
                })
                .orElse(ResponseEntity.status(404).body("User not found or deleted"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String jwt = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("jwt".equals(c.getName())) jwt = c.getValue();
            }
        }
        if (jwt != null && jwtUtil.validateToken(jwt)) {
            String email = jwtUtil.extractEmail(jwt);
            return userRepository.findByEmail(email)
                .map(user -> {
                    user.setPassword("");
                    return ResponseEntity.ok(user);
                }).orElse(ResponseEntity.status(401).build());
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setName(userDetails.getName());
                    user.setEmail(userDetails.getEmail());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMyProfile(HttpServletRequest request, @RequestBody User userDetails) {
        String jwt = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("jwt".equals(c.getName())) jwt = c.getValue();
            }
        }
        if (jwt != null && jwtUtil.validateToken(jwt)) {
            String email = jwtUtil.extractEmail(jwt);
            return userRepository.findByEmail(email)
                .map(user -> {
                    user.setName(userDetails.getName());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.status(401).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setStatus("DELETED");
            userRepository.save(user);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Void> restoreUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setStatus("ACTIVE");
            userRepository.save(user);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/password-prompt/dismiss")
    public ResponseEntity<?> dismissPasswordPrompt(HttpServletRequest request) {
        String jwt = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("jwt".equals(c.getName())) jwt = c.getValue();
            }
        }
        if (jwt != null && jwtUtil.validateToken(jwt)) {
            String email = jwtUtil.extractEmail(jwt);
            return userRepository.findByEmail(email)
                .map(user -> {
                    user.setPasswordPromptStatus("DEFAULT");
                    user.setPasswordUpdatedAt(LocalDateTime.now()); // 다음에 변경하기 시 기준시점을 현재로 리셋
                    userRepository.save(user);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.status(401).build());
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/password")
    public ResponseEntity<?> changePassword(HttpServletRequest request, @RequestBody Map<String, String> payload) {
        String jwt = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("jwt".equals(c.getName())) jwt = c.getValue();
            }
        }
        if (jwt != null && jwtUtil.validateToken(jwt)) {
            String email = jwtUtil.extractEmail(jwt);
            String newPassword = payload.get("newPassword");
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("새 비밀번호를 입력해주세요.");
            }
            return userRepository.findByEmail(email)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    user.setPasswordPromptStatus("DEFAULT");
                    user.setPasswordUpdatedAt(LocalDateTime.now()); // 비밀번호 변경 완료 시 기준시점을 현재로 리셋
                    userRepository.save(user);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.status(401).build());
        }
        return ResponseEntity.status(401).build();
    }
}
