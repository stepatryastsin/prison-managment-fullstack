package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Cell;
import com.example.PrisonManagement.Service.CellService;
import com.example.PrisonManagement.Service.PrisonerService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/cells")
@CrossOrigin(origins = "http://localhost:3000")
public class CellController {

    private final CellService cellService;
    private final PrisonerService prisonerService;
@Autow
    public CellController(CellService cellService, PrisonerService prisonerService) {
        this.cellService = cellService;
        this.prisonerService = prisonerService;
    }

    @GetMapping
    public ResponseEntity<List<Cell>> getAllCells() {
        List<Cell> cells = cellService.getAllCells();
        return ResponseEntity.ok(cells);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cell> getCellById(@PathVariable Integer id) {
        Cell cell = cellService.getById(id);
        return ResponseEntity.ok(cell);
    }

    @PostMapping
    public ResponseEntity<Cell> createCell(@RequestBody Cell cell) {
        Cell createdCell = cellService.createCell(cell);
        return new ResponseEntity<>(createdCell, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cell> updateCell(@PathVariable Integer id, @RequestBody Cell cell) {
        Cell updatedCell = cellService.updateCell(id, cell);
        return ResponseEntity.ok(updatedCell);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCell(@PathVariable Integer id) {
        if (prisonerService.existsPrisonerInCell(id)) {
            // Если да, возвращаем статус 409 (CONFLICT), сигнализируя, что удаление невозможно
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        cellService.deleteCell(id);
        return ResponseEntity.noContent().build();
    }
}