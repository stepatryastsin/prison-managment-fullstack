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


@RestController
@RequestMapping("/api/job")
@CrossOrigin(origins = "http://localhost:3000")
public class JobController {

    private final JobService service;

    @Autowired
    public JobController(JobService service) {
        this.service = service;
    }

    @GetMapping
    public List<Job> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Job getOne(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Job create(@RequestBody @Valid Job job) {
        return service.create(job);
    }

    @PutMapping("/{id}")
    public Job update(@PathVariable Integer id, @RequestBody @Valid Job job) {
        return service.update(id, job);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

    @GetMapping("/{id}/usage")
    public Map<String, Integer> getUsage(@PathVariable Integer id) {
        int usage = service.getUsageCount(id);
        Map<String, Integer> result = new HashMap<>();
        result.put("usageCount", usage);
        return result;
    }
}