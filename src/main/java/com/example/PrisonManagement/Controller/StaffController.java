package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Service.StaffService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin("http://localhost:3000")
@Validated
public class StaffController {

    private static final Logger logger = LoggerFactory.getLogger(StaffController.class);
    private final StaffService service;

    @Autowired
    public StaffController(StaffService service) {
        this.service = service;
        logger.info("StaffController initialized");
    }

    @GetMapping
    public List<Staff> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Staff getOne(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Staff create(@RequestBody @Valid Staff staff) {
        return service.create(staff);
    }

    @PutMapping("/{id}")
    public Staff update(@PathVariable Integer id,
                        @RequestBody @Valid Staff staff) {
        return service.update(id, staff);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

    @GetMapping("/job/{jobId}/usage")
    public int getUsage(@PathVariable Integer jobId) {
        return service.getUsageCount(jobId);
    }

    @PostMapping("/set-password")
    public String setPassword(@RequestParam String username,
                              @RequestParam String password) {
        service.setPassword(username, password);
        return "Password set for " + username;
    }
}