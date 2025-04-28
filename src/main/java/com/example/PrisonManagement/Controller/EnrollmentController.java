package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.EnrolledIn;
import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Service.EnrollmentCertificateServiceInterface;
import com.example.PrisonManagement.impl.EnrollmentCertificateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class EnrollmentController {

    private final EnrollmentCertificateService service;

    @Autowired
    public EnrollmentController(EnrollmentCertificateService service) {
        this.service = service;
    }

    @GetMapping("/enrollments")
    public List<EnrolledIn> getAllEnrollments() {
        return service.findAllEnrollments();
    }

    @PostMapping("/enrollments")
    @ResponseStatus(HttpStatus.CREATED)
    public EnrolledIn enroll(@RequestBody @Valid EnrolledIn enrollment) {
        return service.enrollPrisoner(enrollment);
    }

    @DeleteMapping("/enrollments/{prisonerId}/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEnrollment(@PathVariable Integer prisonerId,
                                 @PathVariable Integer courseId) {
        service.deleteEnrollment(prisonerId, courseId);
    }

    @GetMapping("/certificates")
    public List<OwnCertificateFrom> getAllCertificates() {
        return service.findAllCertificates();
    }

    @PostMapping("/certificates")
    @ResponseStatus(HttpStatus.CREATED)
    public OwnCertificateFrom issue(@RequestBody @Valid OwnCertificateFrom certificate) {
        return service.issueCertificate(certificate);
    }

    @DeleteMapping("/certificates/{prisonerId}/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCertificate(@PathVariable Integer prisonerId,
                                  @PathVariable Integer courseId) {
        service.deleteCertificate(prisonerId, courseId);
    }
}