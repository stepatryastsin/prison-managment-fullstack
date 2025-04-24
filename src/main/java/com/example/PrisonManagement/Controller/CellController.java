package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Cell;
import com.example.PrisonManagement.Service.CellService;


import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cells")
@CrossOrigin(origins = "http://localhost:3000")
public class CellController {
    private final CellService cellService;
    private final Logger logger = LoggerFactory.getLogger(CellController.class);
    @Autowired
    public CellController(CellService cellService) {
        this.cellService = cellService;
    }

    @GetMapping
    public ResponseEntity<List<Cell>> getAllCells() {
        List<Cell> cells = cellService.getAllCells();
        logger.info("Получено {} камер", cells.size());
        return ResponseEntity.ok(cells);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cell> getCellById(@PathVariable Integer id) {
        return cellService.getCellById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    logger.warn("Не найдена камера с id {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<Cell> createCell(@RequestBody Cell cell) {
        final Cell createCell = cellService.createCell(cell);
        logger.info("Камера {} была зарегестрированна ",createCell);
        return new ResponseEntity<>(createCell, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cell> updateCell(
            @PathVariable Integer id,
            @Valid @RequestBody Cell cell
    ) {
        return cellService.getCellById(id)
                .map(existing -> {
                    Cell updated = cellService.updateCell(id, cell);
                    logger.info("Данные камеры с id {} были изменены на {}", id, updated);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> {
                    logger.warn("Не найдена камера с id {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCell(@PathVariable Integer id) {
        if (cellService.hasPrisoners(id)) {
            logger.warn("Попытка удалить камеру с id {}: в камере есть заключённые", id);
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        cellService.deleteCell(id);
        logger.info("Камера с id {} успешно удалена", id);
        return ResponseEntity.noContent().build();
    }
}