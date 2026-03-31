package com.example.batch.job;

import com.example.batch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.CommandLineRunner;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParameters;

import java.time.LocalDateTime;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class PasswordReminderJobConfig implements CommandLineRunner {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final UserRepository userRepository;
    private final JobLauncher jobLauncher;

    @Override
    public void run(String... args) throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addString("JobID", String.valueOf(System.currentTimeMillis()))
                .toJobParameters();
        jobLauncher.run(passwordReminderJob(), params);
    }

    @Bean
    public Job passwordReminderJob() {
        return jobBuilderFactory.get("passwordReminderJob")
                .incrementer(new RunIdIncrementer())
                .start(passwordReminderStep())
                .build();
    }

    @Bean
    public Step passwordReminderStep() {
        return stepBuilderFactory.get("passwordReminderStep")
                .tasklet((contribution, chunkContext) -> {
                    // 원래 1일 경과이지만 테스트 편의성을 위해 1분으로 설정하거나 1일로 설정 후 강제 데이터 조작
                    LocalDateTime targetTime = LocalDateTime.now().minusDays(1);
                    
                    log.info("Batch execution started. Target cutoff time: {}", targetTime);
                    int updatedCount = userRepository.updatePasswordPromptRequired(targetTime);
                    log.info("Batch execution complete! Successfully updated {} users older than 24 hours.", updatedCount);
                    
                    return RepeatStatus.FINISHED;
                })
                .build();
    }
}
