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
@RequestMapping("/api/security-levels")
@CrossOrigin(origins = "http://localhost:3000")
public class SecurityLevelController {

    private static final Logger logger = LoggerFactory.getLogger(SecurityLevelController.class);
    private final SecurityLevelService securityLevelService;

    public SecurityLevelController(SecurityLevelService securityLevelService) {
        this.securityLevelService = securityLevelService;
        logger.info("SecurityLevelController инициализирован");
    }

    @GetMapping
    public ResponseEntity<List<SecurityLevel>> getAll() {
        logger.info("Получен запрос GET /api/security-levels - получить все уровни безопасности");
        List<SecurityLevel> levels = securityLevelService.findAll();
        logger.info("Найдено {} уровней безопасности", levels.size());
        return ResponseEntity.ok(levels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SecurityLevel> getById(@PathVariable Integer id) {
        logger.info("Получен запрос GET /api/security-levels/{} - получить уровень безопасности", id);
        SecurityLevel level = securityLevelService.findById(id);
        if (level != null) {
            logger.info("Уровень безопасности с ID {} найден: {}", id, level.getDescription());
        } else {
            logger.warn("Уровень безопасности с ID {} не найден", id);
        }
        return ResponseEntity.ok(level);
    }

    @PostMapping
    public ResponseEntity<SecurityLevel> create(@RequestBody @Valid SecurityLevel level) {
        logger.info("Получен запрос POST /api/security-levels - создать уровень безопасности: {}", level);
        SecurityLevel created = securityLevelService.create(level);
        logger.info("Создан уровень безопасности с ID {}", created.getSecurityLevelNo());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SecurityLevel> update(
            @PathVariable Integer id,
            @RequestBody @Valid SecurityLevel levelDetails
    ) {
        logger.info("Получен запрос PUT /api/security-levels/{} - обновить уровень безопасности", id);
        SecurityLevel updated = securityLevelService.update(id, levelDetails);
        logger.info("Обновлён уровень безопасности с ID {}", id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        logger.info("Получен запрос DELETE /api/security-levels/{} - удалить уровень безопасности", id);
        securityLevelService.delete(id);
        logger.info("Удалён уровень безопасности с ID {}", id);
        return ResponseEntity.noContent().build();
    }
}
