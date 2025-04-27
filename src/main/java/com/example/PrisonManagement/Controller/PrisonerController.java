package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Service.PrisonerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/prisoners")
@CrossOrigin(origins = "http://localhost:3000")
public class PrisonerController {

    private final PrisonerService service;
    private final Logger logger = LoggerFactory.getLogger(PrisonerController.class);

    @Autowired
    public PrisonerController(PrisonerService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Prisoner>> getAll() {
        List<Prisoner> list = service.getAll();
        logger.info("Найдено {} заключённых", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{prisonerId}")
    public ResponseEntity<Prisoner> getById(@PathVariable Integer prisonerId) {
        Prisoner p = service.findById(prisonerId);
        return ResponseEntity.ok(p);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Prisoner create(@RequestBody @Validated Prisoner prisoner) {
        Prisoner created = service.create(prisoner);
        logger.info("Создан заключённый prisonerId={}", created.getPrisonerId());
        return created;
    }

    @PutMapping("/{prisonerId}")
    public Prisoner update(
            @PathVariable Integer prisonerId,
            @RequestBody @Validated Prisoner prisoner) {
        Prisoner updated = service.update(prisonerId, prisoner);
        logger.info("Обновлён заключённый prisonerId={}", prisonerId);
        return updated;
    }

    @DeleteMapping("/{prisonerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prisonerId) {
        service.delete(prisonerId);
        logger.info("Удалён заключённый prisonerId={}", prisonerId);
    }
}