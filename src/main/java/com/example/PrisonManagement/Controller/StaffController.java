package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Service.StaffService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {

    private final StaffService service;

    @Autowired
    public StaffController(StaffService service) {
        this.service = service;
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
}