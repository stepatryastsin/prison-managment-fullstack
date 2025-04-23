package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.SecurityLevel;
import com.example.PrisonManagement.Service.SecurityLevelService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<List<SecurityLevel>> getAllSecurityLevels() {
        logger.info("Контроллер: получение списка всех уровней безопасности");
        List<SecurityLevel> levels = securityLevelService.getSecurityLevels();
        return new ResponseEntity<>(levels, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SecurityLevel> getSecurityLevelById(@PathVariable Integer id) {
        logger.info("Контроллер: поиск уровня безопасности по id: {}", id);
        Optional<SecurityLevel> levelOpt = securityLevelService.getById(id);
        return levelOpt.map(level -> new ResponseEntity<>(level, HttpStatus.OK))
                .orElseGet(() -> {
                    logger.warn("Контроллер: уровень безопасности с id {} не найден", id);
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                });
    }

    @PostMapping
    public ResponseEntity<SecurityLevel> createSecurityLevel(@RequestBody SecurityLevel securityLevel) {
        logger.info("Контроллер: создание нового уровня безопасности");
        SecurityLevel createdLevel = securityLevelService.createSecurityLevel(securityLevel);
        return new ResponseEntity<>(createdLevel, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SecurityLevel> updateSecurityLevel(@PathVariable Integer id,
                                                             @RequestBody SecurityLevel securityLevel) {
        logger.info("Контроллер: обновление уровня безопасности с id: {}", id);
        Optional<SecurityLevel> updatedLevel = securityLevelService.updateSecurityLevel(id, securityLevel);
        return updatedLevel.map(level -> new ResponseEntity<>(level, HttpStatus.OK))
                .orElseGet(() -> {
                    logger.warn("Контроллер: не найден уровень безопасности с id {} для обновления", id);
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSecurityLevel(@PathVariable Integer id) {
        logger.info("Контроллер: запрос на удаление уровня безопасности с id: {}", id);
        try {
            securityLevelService.deleteSecurityLevel(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Контроллер: ошибка при удалении уровня безопасности с id {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}