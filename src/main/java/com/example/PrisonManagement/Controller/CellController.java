package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Service.CellService;


import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;



@RestController
@RequestMapping("/api/cells")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true",
        allowedHeaders = "*"
)
public class CellController {

    private static final Logger logger = LoggerFactory.getLogger(CellController.class);

    private final CellService service;

    @Autowired
    public CellController(CellService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cell> getAll() {
        logger.info("Запрошен список всех камер");
        List<Cell> cells = service.findAll();
        logger.debug("Найдено камер: {}", cells.size());
        return cells;
    }

    @GetMapping("/{id}")
    public Cell getOne(@PathVariable Integer id) {
        logger.info("Запрошена камера с id={}", id);
        Cell cell = service.findById(id);
        if (cell == null) {
            logger.warn("Камера с id={} не найдена", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Камера не найдена");
        }
        logger.debug("Найдена камера: {}", cell);
        return cell;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cell create(@RequestBody @Valid Cell cell) {
        logger.info("Создание новой камеры: {}", cell);
        Cell created = service.create(cell);
        logger.debug("Камера создана: {}", created);
        return created;
    }

    @PutMapping("/{id}")
    public Cell update(@PathVariable Integer id,
                       @RequestBody @Valid Cell cell) {
        logger.info("Обновление камеры id={} данными: {}", id, cell);
        Cell updated = service.update(id, cell);
        logger.debug("Камера обновлена: {}", updated);
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        logger.info("Запрос на удаление камеры id={}", id);
        if (service.hasPrisoners(id)) {
            logger.warn("Невозможно удалить камеру id={} — в ней ещё есть заключённые", id);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "В камере с id=" + id + " ещё есть заключённые"
            );
        }
        service.delete(id);
        logger.debug("Камера id={} успешно удалена", id);
    }
}