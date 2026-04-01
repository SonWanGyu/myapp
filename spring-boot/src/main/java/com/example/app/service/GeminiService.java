package com.example.app.service;

import com.example.app.dto.AiPlannerRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @SuppressWarnings("unchecked")
    public String generatePlannerResponse(AiPlannerRequest req) {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

        StringBuilder prompt = new StringBuilder("당신은 완벽한 여행 일정을 짜주는 최고의 여행 플래너 AI입니다. 다음 여행 정보에 맞춰 추천 일정을 작성해주세요.\n");
        if ("AUTO".equalsIgnoreCase(req.getMode())) {
            prompt.append("- 모드: AI가 모든 것을 추천 (선택 대륙/국가: ").append(String.join(", ", req.getCountries())).append(")\n");
        } else {
            prompt.append("- 선택 국가: ").append(String.join(", ", req.getCountries())).append("\n");
            prompt.append("- 선택 도시: ").append(String.join(", ", req.getCities())).append("\n");
        }
        prompt.append("- 날짜: ").append(req.getStartDate()).append(" ~ ").append(req.getEndDate()).append("\n");
        prompt.append("- 인원: ").append(req.getHeadCount()).append("명\n");
        prompt.append("- 동반자: ").append(req.getCompanions()).append("\n");
        prompt.append("- 여행 스타일: ").append(String.join(", ", req.getTravelStyles())).append("\n\n");
        
        prompt.append("결과는 반드시 아래의 JSON 형식만 출력해야 합니다. 어떠한 부연 설명도 덧붙이지 마세요.\n");
        prompt.append("{\n");
        prompt.append("  \"title\": \"여행 제목\",\n");
        prompt.append("  \"days\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"day\": \"Day 1\",\n");
        prompt.append("      \"places\": [\n");
        prompt.append("        { \"name\": \"장소명(구글맵 검색 가능한 정확한 이름)\", \"description\": \"장소 설명 및 할 일\" }\n");
        prompt.append("      ]\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> partsMap = new HashMap<>();
        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> textMap = new HashMap<>();
        
        textMap.put("text", prompt.toString());
        parts.add(textMap);
        partsMap.put("parts", parts);
        contents.add(partsMap);
        requestBody.put("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(apiUrl, entity, Map.class);
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");
                    if (!resParts.isEmpty()) {
                        String text = (String) resParts.get(0).get("text");
                        return text.replace("```json", "").replace("```", "").trim();
                    }
                }
            }
            throw new RuntimeException("AI 응답에 candidates가 없습니다. 응답: " + response);
        } catch (HttpClientErrorException e) {
            // 구글이 보낸 HTTP 에러 본문(JSON)을 그대로 전달
            String body = e.getResponseBodyAsString();
            throw new RuntimeException("Google AI API 에러 [" + e.getStatusCode() + "]: " + body);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("AI 서버 통신 실패: " + e.getMessage());
        }
    }
}
