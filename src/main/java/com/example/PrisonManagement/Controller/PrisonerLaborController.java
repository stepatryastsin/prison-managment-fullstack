package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.PrisonerLabor;
import com.example.PrisonManagement.Model.PrisonerLaborKey;
import com.example.PrisonManagement.Service.PrisonerLaborService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prisoner-labor")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class PrisonerLaborController {

    private static final Logger logger = LoggerFactory.getLogger(PrisonerLaborController.class);
    private final PrisonerLaborService prisonerLaborService;

    @Autowired
    public PrisonerLaborController(PrisonerLaborService prisonerLaborService) {
        this.prisonerLaborService = prisonerLaborService;
        logger.info("PrisonerLaborController инициализирован");
    }

    @GetMapping
    public ResponseEntity<List<PrisonerLabor>> getAll() {
        logger.info("Получен запрос GET /api/prisoner-labor - получить все записи тюремного труда");
        List<PrisonerLabor> list = prisonerLaborService.findAll();
        logger.info("Получено {} записей тюремного труда", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{prisonerId}/{staffId}")
    public ResponseEntity<PrisonerLabor> getById(@PathVariable Integer prisonerId,
                                                 @PathVariable Integer staffId) {
        logger.info("Получен запрос GET /api/prisoner-labor/{}/{} - получить запись тюремного труда", prisonerId, staffId);
        PrisonerLabor prisonerLabor = prisonerLaborService.findById(prisonerId, staffId);
        if (prisonerLabor != null) {
            logger.info("Найдена запись тюремного труда с ключом ({}, {})", prisonerId, staffId);
        } else {
            logger.warn("Запись тюремного труда с ключом ({}, {}) не найдена", prisonerId, staffId);
        }
        return ResponseEntity.ok(prisonerLabor);
    }

    @PostMapping
    public ResponseEntity<PrisonerLabor> create(@RequestBody PrisonerLabor prisonerLabor) {
        logger.info("Получен запрос POST /api/prisoner-labor - создать запись тюремного труда: {}", prisonerLabor);
        PrisonerLabor created = prisonerLaborService.save(prisonerLabor);
        logger.info("Создана запись тюремного труда с ключом ({}, {})", created.getId().getPrisonerId(), created.getId().getStaffId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{prisonerId}/{staffId}")
    public ResponseEntity<PrisonerLabor> update(@PathVariable Integer prisonerId,
                                                @PathVariable Integer staffId,
                                                @RequestBody PrisonerLabor prisonerLabor) {
        logger.info("Получен запрос PUT /api/prisoner-labor/{}/{} - обновить запись тюремного труда", prisonerId, staffId);
        prisonerLabor.setId(new PrisonerLaborKey(prisonerId, staffId));
        PrisonerLabor updated = prisonerLaborService.save(prisonerLabor);
        logger.info("Обновлена запись тюремного труда с ключом ({}, {})", prisonerId, staffId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{prisonerId}/{staffId}")
    public ResponseEntity<Void> delete(@PathVariable Integer prisonerId,
                                       @PathVariable Integer staffId) {
        logger.info("Получен запрос DELETE /api/prisoner-labor/{}/{} - удалить запись тюремного труда", prisonerId, staffId);
        prisonerLaborService.deleteById(prisonerId, staffId);
        logger.info("Удалена запись тюремного труда с ключом ({}, {})", prisonerId, staffId);
        return ResponseEntity.noContent().build();
    }
}