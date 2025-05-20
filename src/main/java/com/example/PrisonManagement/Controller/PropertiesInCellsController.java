package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;
import com.example.PrisonManagement.Service.PropertiesInCellsService;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class PropertiesInCellsController {

    private static final Logger logger = LoggerFactory.getLogger(PropertiesInCellsController.class);
    private final PropertiesInCellsService service;

    @Autowired
    public PropertiesInCellsController(PropertiesInCellsService service) {
        this.service = service;
        logger.info("PropertiesInCellsController инициализирован");
    }

    @GetMapping
    public List<PropertiesInCells> getAll() {
        logger.info("Получен запрос GET /api/properties-in-cells - получить все свойства в камерах");
        List<PropertiesInCells> list = service.findAll();
        logger.info("Найдено {} записей свойств в камерах", list.size());
        return list;
    }

    @GetMapping("/{prisonerId}/{description}")
    public PropertiesInCells getById(
            @PathVariable Integer prisonerId,
            @PathVariable String description) {
        logger.info("Получен запрос GET /api/properties-in-cells/{}/{} - получить свойство в камере", prisonerId, description);
        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId);
        PropertiesInCells prop = service.findById(key);
        if (prop != null) {
            logger.info("Найдено свойство '{}' для заключённого с ID {}", description, prisonerId);
        } else {
            logger.warn("Свойство '{}' для заключённого с ID {} не найдено", description, prisonerId);
        }
        return prop;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertiesInCells create(
            @RequestBody @Valid PropertiesInCells properties) {
        logger.info("Получен запрос POST /api/properties-in-cells - создать свойство в камере: {}", properties);
        PropertiesInCells created = service.create(properties);
        logger.info("Создано свойство '{}' для заключённого с ID {}", created.getDescription(), created.getId().getPrisonerId());
        return created;
    }

    @PutMapping("/{prisonerId}/{description}")
    public PropertiesInCells update(
            @PathVariable Integer prisonerId,
            @PathVariable String description,
            @RequestBody @Valid PropertiesInCells properties) {
        logger.info("Получен запрос PUT /api/properties-in-cells/{}/{} - обновить свойство в камере", prisonerId, description);
        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId);
        PropertiesInCells updated = service.update(key, properties);
        logger.info("Обновлено свойство '{}' для заключённого с ID {}", description, prisonerId);
        return updated;
    }

    @DeleteMapping("/{prisonerId}/{description}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Integer prisonerId,
            @PathVariable String description) {
        logger.info("Получен запрос DELETE /api/properties-in-cells/{}/{} - удалить свойство в камере", prisonerId, description);
        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId);
        service.delete(key);
        logger.info("Удалено свойство '{}' для заключённого с ID {}", description, prisonerId);
    }
}
