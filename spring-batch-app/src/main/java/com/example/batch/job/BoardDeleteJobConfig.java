package com.example.batch.job;

import com.example.batch.repository.BoardRepository;
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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.JobParameters;

import java.time.LocalDateTime;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class BoardDeleteJobConfig {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final BoardRepository boardRepository;
    private final JobLauncher jobLauncher;

    // Run every 10 minutes
    @Scheduled(cron = "0 0/10 * * * *")
    public void scheduleHourlyDeletionJob() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addString("JobID", String.valueOf(System.currentTimeMillis()))
                .toJobParameters();
        jobLauncher.run(deleteOldBoardsJob(), params);
    }
    
    // Uncomment to test minutely if needed during local debugging.
    /*
    @Scheduled(cron = "0 * * * * *")
    public void scheduleMinutelyDeletionJob() throws Exception {
        scheduleHourlyDeletionJob();
    }
    */

    @Bean
    public Job deleteOldBoardsJob() {
        return jobBuilderFactory.get("deleteOldBoardsJob")
                .incrementer(new RunIdIncrementer())
                .start(deleteOldBoardsStep())
                .build();
    }

    @Bean
    public Step deleteOldBoardsStep() {
        return stepBuilderFactory.get("deleteOldBoardsStep")
                .tasklet((contribution, chunkContext) -> {
                    // Calculate exactly 24 hours ago
                    LocalDateTime targetTime = LocalDateTime.now().minusHours(24);
                    
                    log.info("Batch execution started. Target cutoff time: {}", targetTime);
                    int deletedCount = boardRepository.deleteByCreatedAtBefore(targetTime);
                    log.info("Batch execution complete! Successfully deleted {} posts older than 24 hours.", deletedCount);
                    
                    return RepeatStatus.FINISHED;
                })
                .build();
    }
}
