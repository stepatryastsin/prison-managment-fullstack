package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.OwnCertificateFrom;
import com.example.PrisonManagement.Service.OwnCertificateFromService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ownCertificateFrom")
@CrossOrigin(origins = "http://localhost:3000")

@Slf4j
public class OwnCertificateFromController {

    private final OwnCertificateFromService ownCertificateFromService;

    public OwnCertificateFromController(OwnCertificateFromService ownCertificateFromService) {
        this.ownCertificateFromService = ownCertificateFromService;
    }

    @GetMapping
    public ResponseEntity<List<OwnCertificateFrom>> getAll() {
        List<OwnCertificateFrom> list = ownCertificateFromService.getAll();
        log.info("Получено {} сертификатов", list.size());
        return ResponseEntity.ok(list);
    }

    // Получить сертификат по составному ключу
    @GetMapping("/{prisonerId}/{courseId}")
    public ResponseEntity<OwnCertificateFrom> getById(@PathVariable Integer prisonerId,
                                                      @PathVariable Integer courseId) {
        OwnCertificateFrom certificate = ownCertificateFromService.getById(prisonerId, courseId);
        log.info("Найден сертификат с ключом ({}, {})", prisonerId, courseId);
        return ResponseEntity.ok(certificate);
    }

    // Создать сертификат
    @PostMapping
    public ResponseEntity<OwnCertificateFrom> create(@RequestBody OwnCertificateFrom ownCertificateFrom) {
        OwnCertificateFrom created = ownCertificateFromService.create(ownCertificateFrom);
        log.info("Создан сертификат с ключом ({}, {})",
                created.getId().getPrisonerId(), created.getId().getCourseId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Обновить сертификат по составному ключу
    @PutMapping("/{prisonerId}/{courseId}")
    public ResponseEntity<OwnCertificateFrom> update(@PathVariable Integer prisonerId,
                                                     @PathVariable Integer courseId,
                                                     @RequestBody OwnCertificateFrom ownCertificateFrom) {
        OwnCertificateFrom updated = ownCertificateFromService.update(prisonerId, courseId, ownCertificateFrom);
        log.info("Обновлён сертификат с ключом ({}, {})", prisonerId, courseId);
        return ResponseEntity.ok(updated);
    }

    // Удаление сертификата (перманентное удаление)
    @DeleteMapping("/{prisonerId}/{courseId}")
    public ResponseEntity<OwnCertificateFrom> delete(@PathVariable Integer prisonerId,
                                                     @PathVariable Integer courseId) {
        OwnCertificateFrom deleted = ownCertificateFromService.delete(prisonerId, courseId);
        log.info("Удалён сертификат с ключом ({}, {})", prisonerId, courseId);
        return ResponseEntity.ok(deleted);
    }
}