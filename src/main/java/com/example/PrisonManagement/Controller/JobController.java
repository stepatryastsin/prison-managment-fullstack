package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Job;

import com.example.PrisonManagement.Service.JobService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/job")
@CrossOrigin(origins = "http://localhost:3000")
public class JobController {

    private static final Logger logger = LoggerFactory.getLogger(JobController.class);
    private final JobService service;

    @Autowired
    public JobController(JobService service) {
        this.service = service;
        logger.info("JobController инициализирован");
    }

    @GetMapping
    public List<Job> getAll() {
        logger.info("Получен запрос: получить все вакансии");
        List<Job> jobs = service.findAll();
        logger.info("Количество вакансий, возвращенных сервисом: {}", jobs.size());
        return jobs;
    }

    @GetMapping("/{id}")
    public Job getOne(@PathVariable Integer id) {
        logger.info("Получен запрос: получить вакансию с id={}", id);
        Job job = service.findById(id);
        if (job != null) {
            logger.info("Вакансия найдена: {}", job);
        } else {
            logger.warn("Вакансия с id={} не найдена", id);
        }
        return job;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Job create(@RequestBody @Valid Job job) {
        logger.info("Получен запрос: создать новую вакансию: {}", job);
        Job created = service.create(job);
        logger.info("Вакансия успешно создана с id={}", created.getJobId());
        return created;
    }

    @PutMapping("/{id}")
    public Job update(@PathVariable Integer id, @RequestBody @Valid Job job) {
        logger.info("Получен запрос: обновить вакансию с id={}: новые данные={}", id, job);
        Job updated = service.update(id, job);
        logger.info("Вакансия с id={} успешно обновлена", id);
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        logger.info("Получен запрос: удалить вакансию с id={}", id);
        service.delete(id);
        logger.info("Вакансия с id={} успешно удалена", id);
    }

    @GetMapping("/{id}/usage")
    public Map<String, Integer> getUsage(@PathVariable Integer id) {
        logger.info("Получен запрос: получить количество использований вакансии с id={}", id);
        int usage = service.getUsageCount(id);
        logger.info("Количество использований для вакансии id={}: {}", id, usage);
        Map<String, Integer> result = new HashMap<>();
        result.put("usageCount", usage);
        return result;
    }
}
