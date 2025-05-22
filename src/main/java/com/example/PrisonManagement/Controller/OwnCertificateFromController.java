package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Service.CertificateService;
import com.example.PrisonManagement.Service.OwnCertificateFromService;
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

import java.io.ByteArrayOutputStream;
import java.util.List;

@RestController
@RequestMapping("/api/ownCertificateFrom")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class OwnCertificateFromController {

    private static final Logger logger = LoggerFactory.getLogger(OwnCertificateFromController.class);
    private final OwnCertificateFromService service;
    private final CertificateService certService;
    @Autowired
    public OwnCertificateFromController(OwnCertificateFromService service, CertificateService certService) {
        this.service = service;
        this.certService = certService;
        logger.info("OwnCertificateFromController инициализирован");
    }

    @GetMapping
    public List<OwnCertificateFrom> getAll() {
        logger.info("Получен запрос GET /api/ownCertificateFrom - получить все записи сертификатов");
        List<OwnCertificateFrom> list = service.findAll();
        logger.info("Найдено {} записей сертификатов", list.size());
        return list;
    }

    @GetMapping("/{prisonerId}/{courseId}")
    public OwnCertificateFrom getOne(@PathVariable Integer prisonerId,
                                     @PathVariable Integer courseId) {
        logger.info("Получен запрос GET /api/ownCertificateFrom/{}/{} - получить запись сертификата", prisonerId, courseId);
        OwnCertificateFrom cert = service.findById(prisonerId, courseId);
        if (cert != null) {
            logger.info("Запись сертификата для PrisonerId={} и CourseId={} найдена", prisonerId, courseId);
        } else {
            logger.warn("Запись сертификата для PrisonerId={} и CourseId={} не найдена", prisonerId, courseId);
        }
        return cert;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OwnCertificateFrom create(@RequestBody @Valid OwnCertificateFrom ownCertificate) {
        logger.info("Получен запрос POST /api/ownCertificateFrom - создать новую запись сертификата: {}", ownCertificate);
        OwnCertificateFrom created = service.create(ownCertificate);
        logger.info("Запись сертификата создана для PrisonerId={} и CourseId={}", created.getPrisoner().getPrisonerId(), created.getCourse().getCourseId());
        return created;
    }

    @PutMapping("/{prisonerId}/{courseId}")
    public OwnCertificateFrom update(@PathVariable Integer prisonerId,
                                     @PathVariable Integer courseId,
                                     @RequestBody @Valid OwnCertificateFrom ownCertificate) {
        logger.info("Получен запрос PUT /api/ownCertificateFrom/{}/{} - обновить запись сертификата", prisonerId, courseId);
        OwnCertificateFrom updated = service.update(prisonerId, courseId, ownCertificate);
        logger.info("Запись сертификата для PrisonerId={} и CourseId={} обновлена", prisonerId, courseId);
        return updated;
    }

    @DeleteMapping("/{prisonerId}/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prisonerId,
                       @PathVariable Integer courseId) {
        logger.info("Получен запрос DELETE /api/ownCertificateFrom/{}/{} - удалить запись сертификата", prisonerId, courseId);
        service.delete(prisonerId, courseId);
        logger.info("Запись сертификата для PrisonerId={} и CourseId={} удалена", prisonerId, courseId);
    }
    @GetMapping(
            value = "/{prisonerId}/{courseId}/download",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Integer prisonerId,
            @PathVariable Integer courseId) {

        logger.info("GET /api/ownCertificateFrom/{}/{}/download – generating PDF", prisonerId, courseId);

        // Генерируем сертификат
        ByteArrayOutputStream baos = certService.generateCertificate(prisonerId, courseId);
        byte[] pdfBytes = baos.toByteArray();

        // Заголовки для скачивания
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData(
                "attachment",
                String.format("certificate_%d_%d.pdf", prisonerId, courseId)
        );

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
