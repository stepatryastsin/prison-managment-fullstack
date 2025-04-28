package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Service.CellService;


import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@RestController
@RequestMapping("/api/cells")
@CrossOrigin(origins = "http://localhost:3000")
public class CellController {

    private final CellService service;

    @Autowired
    public CellController(CellService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cell> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Cell getOne(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cell create(@RequestBody @Valid Cell cell) {
        return service.create(cell);
    }

    @PutMapping("/{id}")
    public Cell update(@PathVariable Integer id,
                       @RequestBody @Valid Cell cell) {
        return service.update(id, cell);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        if (service.hasPrisoners(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "В камере с id=" + id + " ещё есть заключённые");
        }
        service.delete(id);
    }
}