package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;
import com.example.PrisonManagement.Service.PropertiesInCellsService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties-in-cells")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertiesInCellsController {

    private final PropertiesInCellsService service;

    @Autowired
    public PropertiesInCellsController(PropertiesInCellsService service) {
        this.service = service;
    }

    @GetMapping
    public List<PropertiesInCells> getAll() {
        return service.findAll();
    }

    @GetMapping("/{prisonerId}/{description}")
    public PropertiesInCells getById(
            @PathVariable Integer prisonerId,
            @PathVariable String description) {

        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId);
        return service.findById(key);
    }

    /** POST  /api/properties-in-cells */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertiesInCells create(
            @RequestBody @Valid PropertiesInCells properties) {

        return service.create(properties);
    }

    @PutMapping("/{prisonerId}/{description}")
    public PropertiesInCells update(
            @PathVariable Integer prisonerId,
            @PathVariable String description,
            @RequestBody @Valid PropertiesInCells properties) {

        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId);
        return service.update(key, properties);
    }

    @DeleteMapping("/{prisonerId}/{description}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Integer prisonerId,
            @PathVariable String description) {

        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId);
        service.delete(key);
    }
}