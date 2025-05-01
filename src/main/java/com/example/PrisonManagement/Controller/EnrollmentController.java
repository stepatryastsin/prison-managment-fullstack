package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.EnrolledIn;
import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.impl.EnrollmentCertificateService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class EnrollmentController {

    private final EnrollmentCertificateService service;
    private final Logger logger = LoggerFactory.getLogger(EnrollmentController.class);

    @Autowired
    public EnrollmentController(EnrollmentCertificateService service) {
        this.service = service;
    }

    @GetMapping("/enrollments")
    public List<EnrolledIn> getAllEnrollments() {
        List<EnrolledIn> list = service.findAllEnrollments();
        logger.info("Получен список всех записей о зачислениях. Количество: {}", list.size());
        return list;
    }

    @PostMapping("/enrollments")
    @ResponseStatus(HttpStatus.CREATED)
    public EnrolledIn enroll(@RequestBody @Valid EnrolledIn enrollment) {
        logger.info("Зачисление: заключённый ID={} записан на курс ID={}",
                enrollment.getPrisoner().getPrisonerId(),
                enrollment.getCourse().getCourseId());
        return service.enrollPrisoner(enrollment);
    }

    @DeleteMapping("/enrollments/{prisonerId}/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEnrollment(@PathVariable Integer prisonerId,
                                 @PathVariable Integer courseId) {
        logger.info("Удаление зачисления: заключённый ID={} отчислен с курса ID={}", prisonerId, courseId);
        service.deleteEnrollment(prisonerId, courseId);
    }

    @GetMapping("/certificates")
    public List<OwnCertificateFrom> getAllCertificates() {
        List<OwnCertificateFrom> list = service.findAllCertificates();
        logger.info("Получен список всех выданных сертификатов. Количество: {}", list.size());
        return list;
    }

    @PostMapping("/certificates")
    @ResponseStatus(HttpStatus.CREATED)
    public OwnCertificateFrom issue(@RequestBody @Valid OwnCertificateFrom certificate) {
        logger.info("Выдача сертификата: заключённому ID={} за курс ID={}",
                certificate.getPrisoner().getPrisonerId(),
                certificate.getCourse().getCourseId());
        return service.issueCertificate(certificate);
    }

    @DeleteMapping("/certificates/{prisonerId}/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCertificate(@PathVariable Integer prisonerId,
                                  @PathVariable Integer courseId) {
        logger.info("Удаление сертификата: заключённый ID={} потерял сертификат по курсу ID={}", prisonerId, courseId);
        service.deleteCertificate(prisonerId, courseId);
    }
}
