package com.example.app.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiPlannerRequest {
    private String mode; // AUTO, MANUAL
    private List<String> countries;
    private List<String> cities;
    private String startDate;
    private String endDate;
    private Integer headCount;
    private String companions;
    private List<String> travelStyles;
    private String tempo; // BUSY, RELAX
}
