package com.example.app.controller;

import com.example.app.domain.Itinerary;
import com.example.app.repository.ItineraryRepository;
import com.example.app.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    private final ItineraryRepository itineraryRepository;
    private final JwtUtil jwtUtil;

    public ItineraryController(ItineraryRepository itineraryRepository, JwtUtil jwtUtil) {
        this.itineraryRepository = itineraryRepository;
        this.jwtUtil = jwtUtil;
    }

    private String getEmailFromJwt(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("jwt".equals(c.getName()) && jwtUtil.validateToken(c.getValue())) {
                    return jwtUtil.extractEmail(c.getValue());
                }
            }
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> saveItinerary(HttpServletRequest request, @RequestBody Itinerary itinerary) {
        String email = getEmailFromJwt(request);
        if (email == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        
        itinerary.setEmail(email);
        return ResponseEntity.ok(itineraryRepository.save(itinerary));
    }

    @GetMapping
    public ResponseEntity<?> getMyItineraries(HttpServletRequest request) {
        String email = getEmailFromJwt(request);
        if (email == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        
        List<Itinerary> list = itineraryRepository.findByEmailOrderByStartDateDesc(email);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItineraryById(HttpServletRequest request, @PathVariable Long id) {
        String email = getEmailFromJwt(request);
        if (email == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        
        return itineraryRepository.findById(id)
            .filter(it -> it.getEmail().equals(email))
            .map(it -> ResponseEntity.ok((Object) it))
            .orElse(ResponseEntity.status(404).body("일정을 찾을 수 없습니다."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItinerary(HttpServletRequest request, @PathVariable Long id) {
        String email = getEmailFromJwt(request);
        if (email == null) return ResponseEntity.status(401).body("로그인이 필요합니다.");
        
        return itineraryRepository.findById(id)
            .filter(it -> it.getEmail().equals(email))
            .map(it -> {
                itineraryRepository.delete(it);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.status(404).body("일정을 찾을 수 없습니다."));
    }
}
