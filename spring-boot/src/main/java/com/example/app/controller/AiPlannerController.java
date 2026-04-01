package com.example.app.controller;

import com.example.app.dto.AiPlannerRequest;
import com.example.app.dto.AiPlannerResponse;
import com.example.app.service.GeminiService;
import com.example.app.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/planner")
public class AiPlannerController {

    private final GeminiService geminiService;
    private final JwtUtil jwtUtil;

    public AiPlannerController(GeminiService geminiService, JwtUtil jwtUtil) {
        this.geminiService = geminiService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generatePlanner(HttpServletRequest request, @RequestBody AiPlannerRequest payload) {
        // 권한 체크: 비회원이더라도 체험하게 해줄지, 아니면 반드시 로그인된 상태에서만 생성할지
        // 본 로직에서는 임의로 누구나 요청 가능하도록 구현하되(또는 로그인 요구), 토큰 유효성은 최소 확인
        /* 
        String jwt = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("jwt".equals(c.getName())) jwt = c.getValue();
            }
        }
        if (jwt == null || !jwtUtil.validateToken(jwt)) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        } 
        */

        // 실제 AI 요청
        try {
            String jsonResult = geminiService.generatePlannerResponse(payload);
            return ResponseEntity.ok(new AiPlannerResponse(jsonResult));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "일정 생성 실패: " + e.getMessage()));
        }
    }
}
