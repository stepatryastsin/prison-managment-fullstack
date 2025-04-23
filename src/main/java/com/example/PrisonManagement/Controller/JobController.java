package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Job;

import com.example.PrisonManagement.Service.JobService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/job")
@CrossOrigin(origins = "http://localhost:3000")
public class JobController {
    private final Logger logger = LoggerFactory.getLogger(JobController.class);
    private final JobService jobService;
    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        List<Job> jobs = jobService.getAllJobs();
        logger.info("Получено {} работ", jobs.size());
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Integer id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Работа с id {} не найдена", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        Job createdJob = jobService.createJob(job);
        logger.info("Создана новая работа: {}", createdJob);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Integer id, @RequestBody Job job) {
        return jobService.updateJob(id, job)
                .map(updatedJob -> {
                    logger.info("Работа с id {} успешно обновлена", id);
                    return ResponseEntity.ok(updatedJob);
                })
                .orElseGet(() -> {
                    logger.warn("Не удалось обновить работу с id {} - запись не найдена", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(@PathVariable Integer id) {
        try {
            jobService.deleteJob(id);
            logger.info("Работа с id {} успешно удалена", id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            logger.warn("Невозможно удалить работу с id {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping(value = "/{id}/usage", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Integer>> getJobUsage(@PathVariable Integer id) {
        int usageCount = jobService.getUsageCount(id);
        Map<String, Integer> result = new HashMap<>();
        result.put("usageCount", usageCount);
        logger.info("Работа с id {} используется {} раз", id, usageCount);
        return ResponseEntity.ok(result);
    }
}