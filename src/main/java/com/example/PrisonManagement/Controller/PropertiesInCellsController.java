package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;
import com.example.PrisonManagement.Service.PropertiesInCellsService;
import jakarta.persistence.EntityNotFoundException;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    /** GET  /api/properties-in-cells */
    @GetMapping
    public List<PropertiesInCells> getAll() {
        return service.findAll();
    }

    /** GET  /api/properties-in-cells/{prisonerId}/{description} */
    @GetMapping("/{prisonerId}/{description}")
    public PropertiesInCells getById(
            @PathVariable Integer prisonerId,
            @PathVariable String description) {

        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId, description);
        return service.findById(key);
    }

    /** POST  /api/properties-in-cells */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertiesInCells create(
            @RequestBody @Valid PropertiesInCells properties) {

        return service.create(properties);
    }

    /** PUT  /api/properties-in-cells/{prisonerId}/{description} */
    @PutMapping("/{prisonerId}/{description}")
    public PropertiesInCells update(
            @PathVariable Integer prisonerId,
            @PathVariable String description,
            @RequestBody @Valid PropertiesInCells properties) {

        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId, description);
        return service.update(key, properties);
    }

    /** DELETE  /api/properties-in-cells/{prisonerId}/{description} */
    @DeleteMapping("/{prisonerId}/{description}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Integer prisonerId,
            @PathVariable String description) {

        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId);
        service.delete(key);
    }
}