package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.PrisonerLabor;
import com.example.PrisonManagement.Model.PrisonerLaborKey;
import com.example.PrisonManagement.Service.PrisonerLaborService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prisoner-labor")
@CrossOrigin(origins = "http://localhost:3000")

public class PrisonerLaborController {

    private final PrisonerLaborService prisonerLaborService;
    private final Logger logger = LoggerFactory.getLogger(PrisonerLaborController.class);
    public PrisonerLaborController(PrisonerLaborService prisonerLaborService) {
        this.prisonerLaborService = prisonerLaborService;
    }

    @GetMapping
    public ResponseEntity<List<PrisonerLabor>> getAll() {
        List<PrisonerLabor> list = prisonerLaborService.findAll();
        logger.info("Получено {} записей тюремного труда", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{prisonerId}/{staffId}")
    public ResponseEntity<PrisonerLabor> getById(@PathVariable Integer prisonerId,
                                                 @PathVariable Integer staffId) {
        PrisonerLabor prisonerLabor = prisonerLaborService.findById(prisonerId, staffId);
        logger.info("Найдена запись тюремного труда с ключом ({}, {})", prisonerId, staffId);
        return ResponseEntity.ok(prisonerLabor);
    }

    @PostMapping
    public ResponseEntity<PrisonerLabor> create(@RequestBody PrisonerLabor prisonerLabor) {
        PrisonerLabor created = prisonerLaborService.save(prisonerLabor);
        logger.info("Создана запись тюремного труда: {}", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{prisonerId}/{staffId}")
    public ResponseEntity<PrisonerLabor> update(@PathVariable Integer prisonerId,
                                                @PathVariable Integer staffId,
                                                @RequestBody PrisonerLabor prisonerLabor) {
        prisonerLabor.setId(new PrisonerLaborKey(prisonerId, staffId));
        PrisonerLabor updated = prisonerLaborService.save(prisonerLabor);
        logger.info("Обновлена запись тюремного труда с ключом ({}, {})", prisonerId, staffId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{prisonerId}/{staffId}")
    public ResponseEntity<Void> delete(@PathVariable Integer prisonerId,
                                       @PathVariable Integer staffId) {
        prisonerLaborService.deleteById(prisonerId, staffId);
        logger.info("Удалена запись тюремного труда с ключом ({}, {})", prisonerId, staffId);
        return ResponseEntity.noContent().build();
    }
}