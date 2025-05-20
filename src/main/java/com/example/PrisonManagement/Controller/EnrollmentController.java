package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.EnrolledIn;
import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.impl.EnrollmentCertificateServiceImpl;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class EnrollmentController {

    private final EnrollmentCertificateServiceImpl service;
    private static final Logger logger = LoggerFactory.getLogger(EnrollmentController.class);

    @Autowired
    public EnrollmentController(EnrollmentCertificateServiceImpl service) {
        this.service = service;
    }

    @GetMapping("/enrollments")
    public List<EnrolledIn> getAllEnrollments() {
        List<EnrolledIn> list = service.getAllEnrollments();
        logger.info("Fetched all enrollments: count={}", list.size());
        return list;
    }

    @PostMapping("/enrollments")
    @ResponseStatus(HttpStatus.CREATED)
    public EnrolledIn enroll(@RequestBody @Valid EnrolledIn enrollment) {
        Integer pid = enrollment.getId().getPrisonerId();
        Integer cid = enrollment.getId().getCourseId();
        logger.info("Enrolling prisoner {} into course {}", pid, cid);
        return service.enrollPrisoner(pid, cid);
    }

    @DeleteMapping("/enrollments/{prisonerId}/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEnrollment(@PathVariable Integer prisonerId,
                                 @PathVariable Integer courseId) {
        logger.info("Deleting enrollment: prisoner={}, course={}", prisonerId, courseId);
        service.deleteEnrollment(prisonerId, courseId);
    }

    @GetMapping("/certificates")
    public List<OwnCertificateFrom> getAllCertificates() {
        List<OwnCertificateFrom> list = service.getAllCertificates();
        logger.info("Fetched all certificates: count={}", list.size());
        return list;
    }

    @PostMapping("/certificates")
    @ResponseStatus(HttpStatus.CREATED)
    public OwnCertificateFrom issue(@RequestBody @Valid OwnCertificateFrom certificate) {
        Integer pid = certificate.getId().getPrisonerId();
        Integer cid = certificate.getId().getCourseId();
        logger.info("Issuing certificate for prisoner={}, course={}", pid, cid);
        return service.issueCertificate(pid, cid);
    }

    @DeleteMapping("/certificates/{prisonerId}/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCertificate(@PathVariable Integer prisonerId,
                                  @PathVariable Integer courseId) {
        logger.info("Deleting certificate: prisoner={}, course={}", prisonerId, courseId);
        service.deleteCertificate(prisonerId, courseId);
    }
}