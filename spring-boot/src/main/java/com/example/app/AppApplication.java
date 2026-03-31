package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class AppApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppApplication.class, args);
    }
    
    @Bean
    public org.springframework.boot.CommandLineRunner initDb(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // 더이상 사용하지 않는 BOARD 테이블 삭제
                jdbcTemplate.execute("DROP TABLE BOARD CASCADE CONSTRAINTS");
            } catch (Exception e) {
                // 테이블이 이미 없거나 삭제 불가능할 경우 무시
                System.out.println("BOARD table skip or already dropped.");
            }
            
            try {
                // 테스트나 이전 계정(thsdhksrb@gmail.com 등)의 비밀번호 안내를 2일 뒤로 설정하여
                // 당장 로그인 시 배치나 프롬프트에 대응할수 있게 가상의 생성일자 조작 가능. 여기선 간단히 업데이트만 시도.
                jdbcTemplate.execute("UPDATE USERS SET CREATED_AT = CURRENT_TIMESTAMP - INTERVAL '2' DAY WHERE PASSWORD_PROMPT_STATUS = 'DEFAULT'");
            } catch (Exception e) {
                // 무시
            }
        };
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedOrigins("*").allowedMethods("*");
            }
        };
    }
}
