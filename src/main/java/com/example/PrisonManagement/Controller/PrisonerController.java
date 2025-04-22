package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Service.PrisonerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prisoners")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class PrisonerController {

    private final PrisonerService prisonerService;

    @GetMapping
    public ResponseEntity<List<Prisoner>> getAllPrisoners() {
        List<Prisoner> prisoners = prisonerService.getAllPrisoners();
        log.info("Получено {} заключённых", prisoners.size());
        return ResponseEntity.ok(prisoners);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prisoner> getPrisonerById(@PathVariable Integer id) {
        Prisoner prisoner = prisonerService.findById(id);
        log.info("Найден заключённый с id {}", id);
        return ResponseEntity.ok(prisoner);
    }

    @PostMapping
    public ResponseEntity<Prisoner> createPrisoner(@RequestBody Prisoner prisoner) {
        Prisoner created = prisonerService.createPrisoner(prisoner);
        log.info("Создан новый заключённый с id {}", created.getPrisonerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prisoner> updatePrisoner(@PathVariable Integer id, @RequestBody Prisoner prisoner) {
        Prisoner updated = prisonerService.updatePrisoner(id, prisoner);
        log.info("Обновлён заключённый с id {}", id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrisoner(@PathVariable Integer id) {
        prisonerService.deletePrisoner(id);
        log.info("Удалён заключённый с id {}", id);
        return ResponseEntity.noContent().build();
    }
}