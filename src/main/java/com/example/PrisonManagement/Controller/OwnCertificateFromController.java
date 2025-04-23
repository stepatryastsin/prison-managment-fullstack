package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.OwnCertificateFrom;
import com.example.PrisonManagement.Service.OwnCertificateFromService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ownCertificateFrom")
@CrossOrigin(origins = "http://localhost:3000")


public class OwnCertificateFromController {

    private final OwnCertificateFromService ownCertificateFromService;
    private final Logger logger = LoggerFactory.getLogger(OwnCertificateFromController.class);
    public OwnCertificateFromController(OwnCertificateFromService ownCertificateFromService) {
        this.ownCertificateFromService = ownCertificateFromService;
    }

    @GetMapping
    public ResponseEntity<List<OwnCertificateFrom>> getAll() {
        List<OwnCertificateFrom> list = ownCertificateFromService.getAll();
        logger.info("Получено {} сертификатов", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{prisonerId}/{courseId}")
    public ResponseEntity<OwnCertificateFrom> getById(@PathVariable Integer prisonerId,
                                                      @PathVariable Integer courseId) {
        OwnCertificateFrom certificate = ownCertificateFromService.getById(prisonerId, courseId);
        logger.info("Найден сертификат с ключом ({}, {})", prisonerId, courseId);
        return ResponseEntity.ok(certificate);
    }

    @PostMapping
    public ResponseEntity<OwnCertificateFrom> create(@RequestBody OwnCertificateFrom ownCertificateFrom) {
        OwnCertificateFrom created = ownCertificateFromService.create(ownCertificateFrom);
        logger.info("Создан сертификат с ключом ({}, {})",
                created.getId().getPrisonerId(), created.getId().getCourseId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{prisonerId}/{courseId}")
    public ResponseEntity<OwnCertificateFrom> update(@PathVariable Integer prisonerId,
                                                     @PathVariable Integer courseId,
                                                     @RequestBody OwnCertificateFrom ownCertificateFrom) {
        OwnCertificateFrom updated = ownCertificateFromService.update(prisonerId, courseId, ownCertificateFrom);
        logger.info("Обновлён сертификат с ключом ({}, {})", prisonerId, courseId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{prisonerId}/{courseId}")
    public ResponseEntity<OwnCertificateFrom> delete(@PathVariable Integer prisonerId,
                                                     @PathVariable Integer courseId) {
        OwnCertificateFrom deleted = ownCertificateFromService.delete(prisonerId, courseId);
        logger.info("Удалён сертификат с ключом ({}, {})", prisonerId, courseId);
        return ResponseEntity.ok(deleted);
    }
}