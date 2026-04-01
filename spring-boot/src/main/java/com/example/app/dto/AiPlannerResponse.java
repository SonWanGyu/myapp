package com.example.app.dto;

import lombok.Data;

@Data
public class AiPlannerResponse {
    private String resultJson;

    public AiPlannerResponse(String resultJson) {
        this.resultJson = resultJson;
    }
}
