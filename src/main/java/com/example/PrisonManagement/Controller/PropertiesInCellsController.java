package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;
import com.example.PrisonManagement.Service.PropertiesInCellsService;

import jakarta.validation.Valid;
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

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/properties-in-cells")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class PropertiesInCellsController {

    private static final Logger logger = LoggerFactory.getLogger(PropertiesInCellsController.class);
    private final PropertiesInCellsService service;

    @Autowired
    public PropertiesInCellsController(PropertiesInCellsService service) {
        this.service = service;
        logger.info("PropertiesInCellsController initialized");
    }

    // --- Оригинальные CRUD без модели ---
    @GetMapping
    public List<PropertiesInCells> getAll() {
        logger.info("GET /api/properties-in-cells");
        return service.findAll();
    }

    @GetMapping("/{prisonerId}/{name}")
    public PropertiesInCells getById(
            @PathVariable Integer prisonerId,
            @PathVariable String name) {
        logger.info("GET /api/properties-in-cells/{}/{}", prisonerId, name);
        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId, name);
        return service.findById(key);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertiesInCells create(
            @RequestBody @Valid PropertiesInCells properties) {
        logger.info("POST /api/properties-in-cells {}", properties);
        return service.create(properties);
    }

    @PutMapping("/{prisonerId}/{name}")
    public PropertiesInCells update(
            @PathVariable Integer prisonerId,
            @PathVariable String name,
            @RequestBody @Valid PropertiesInCells properties) {
        logger.info("PUT /api/properties-in-cells/{}/{}", prisonerId, name);
        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId, name);
        return service.update(key, properties);
    }

    @DeleteMapping("/{prisonerId}/{name}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Integer prisonerId,
            @PathVariable String name) {
        logger.info("DELETE /api/properties-in-cells/{}/{}", prisonerId, name);
        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId, name);
        service.delete(key);
    }

    // --- Новые эндпоинты для работы с 3D-моделью ---
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PropertiesInCells uploadModel(
            @RequestParam("prisonerId") Integer prisonerId,
            @RequestParam("name") String name,
            @RequestParam("model") MultipartFile file) throws IOException {

        logger.info("POST /api/properties-in-cells/upload prisoner={} name='{}'", prisonerId, name);

        // Создаем объект Prisoner только с ID
        Prisoner prisoner = new Prisoner();
        prisoner.setPrisonerId(prisonerId);

        PropertiesInCells entity = new PropertiesInCells(name , prisoner);
        entity.setModel3d(file.getBytes());

        return service.create(entity);
    }

    @PutMapping(value = "/upload/{prisonerId}/{name}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PropertiesInCells updateModel(
            @PathVariable Integer prisonerId,
            @PathVariable String name,
            @RequestParam("model") MultipartFile file) throws IOException {

        logger.info("PUT /api/properties-in-cells/upload/{}/{}", prisonerId, name);

        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId, name);
        PropertiesInCells entity = service.findById(key);
        entity.setModel3d(file.getBytes());

        return service.update(key, entity);
    }

    @GetMapping("/model/{prisonerId}/{name}")
    public ResponseEntity<byte[]> downloadModel(
            @PathVariable Integer prisonerId,
            @PathVariable String name) {

        logger.info("GET /api/properties-in-cells/model/{}/{}", prisonerId, name);

        PropertiesInCellsKey key = new PropertiesInCellsKey(prisonerId, name);
        PropertiesInCells entity = service.findById(key);

        byte[] data = entity.getModel3d();
        if (data == null || data.length == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"model.obj\"")
                .body(data);
    }
}
