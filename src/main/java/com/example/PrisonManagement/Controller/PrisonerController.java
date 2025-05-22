package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Service.PrisonerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;



@RestController
@RequestMapping("/api/prisoners")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class PrisonerController {

    private static final Logger logger = LoggerFactory.getLogger(PrisonerController.class);
    private final PrisonerService service;

    @Autowired
    public PrisonerController(PrisonerService service) {
        this.service = service;
        logger.info("PrisonerController инициализирован");
    }

    @GetMapping
    public ResponseEntity<List<Prisoner>> getAll() {
        logger.info("GET /api/prisoners — получить всех заключённых");
        List<Prisoner> list = service.getAll();
        logger.info("Найдено {} заключённых", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{prisonerId}")
    public ResponseEntity<Prisoner> getById(@PathVariable Integer prisonerId) {
        logger.info("GET /api/prisoners/{} — получить заключённого по ID", prisonerId);
        Prisoner p = service.findById(prisonerId);
        logger.info("Заключённый с ID {} {}", prisonerId,
                (p != null ? "найден" : "не найден"));
        return ResponseEntity.ok(p);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Prisoner create(@RequestBody @Validated Prisoner prisoner) {
        logger.info("POST /api/prisoners — создать заключённого: {}", prisoner);
        Prisoner created = service.create(prisoner);
        logger.info("Создан заключённый с ID={}", created.getPrisonerId());
        return created;
    }

    @PutMapping("/{prisonerId}")
    public Prisoner update(
            @PathVariable Integer prisonerId,
            @RequestBody @Validated Prisoner prisoner) {
        logger.info("PUT /api/prisoners/{} — обновить заключённого", prisonerId);
        Prisoner updated = service.update(prisonerId, prisoner);
        logger.info("Заключённый с ID {} обновлён", prisonerId);
        return updated;
    }

    @DeleteMapping("/{prisonerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prisonerId) {
        logger.info("DELETE /api/prisoners/{} — удалить заключённого", prisonerId);
        service.delete(prisonerId);
        logger.info("Заключённый с ID {} удалён", prisonerId);
    }


}