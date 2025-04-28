package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.SecurityLevel;
import com.example.PrisonManagement.Service.SecurityLevelService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@RestController
@RequestMapping("/api/sl")
@CrossOrigin(origins = "http://localhost:3000")

public class SecurityLevelController {

    private final SecurityLevelService securityLevelService;
    private final Logger logger = LoggerFactory.getLogger(SecurityLevelController.class);

    public SecurityLevelController(SecurityLevelService securityLevelService) {
        this.securityLevelService = securityLevelService;
    }

    @GetMapping
    public ResponseEntity<List<SecurityLevel>> getAll() {
        logger.info("GET /api/security-levels - fetching all security levels");
        List<SecurityLevel> levels = securityLevelService.findAll();
        logger.info("GET /api/security-levels - returned {} levels", levels.size());
        return ResponseEntity.ok(levels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SecurityLevel> getById(@PathVariable Integer id) {
        logger.info("GET /api/security-levels/{} - fetching security level", id);
        SecurityLevel level = securityLevelService.findById(id);
        logger.info("GET /api/security-levels/{} - found security level {}", id, level.getDescription());
        return ResponseEntity.ok(level);
    }

    @PostMapping
    public ResponseEntity<SecurityLevel> create(@RequestBody @Valid SecurityLevel level) {
        logger.info("POST /api/security-levels - creating security level with id={}", level.getSecurityLevelNo());
        SecurityLevel created = securityLevelService.create(level);
        logger.info("POST /api/security-levels - created security level {}", created.getSecurityLevelNo());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SecurityLevel> update(
            @PathVariable Integer id,
            @RequestBody @Valid SecurityLevel levelDetails
    ) {
        logger.info("PUT /api/security-levels/{} - updating security level", id);
        SecurityLevel updated = securityLevelService.update(id, levelDetails);
        logger.info("PUT /api/security-levels/{} - updated security level", id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        logger.info("DELETE /api/security-levels/{} - deleting security level", id);
        securityLevelService.delete(id);
        logger.info("DELETE /api/security-levels/{} - deleted security level", id);
        return ResponseEntity.noContent().build();
    }
}
