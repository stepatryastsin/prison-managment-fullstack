package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.EnrolledIn;
import com.example.PrisonManagement.Entity.OwnCertificateFrom;
import com.example.PrisonManagement.Service.EnrollmentCertificateServiceInterface;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentCertificateServiceInterface service;

    @PostMapping("/enrollments")
    public ResponseEntity<EnrolledIn> enrollPrisoner(@RequestBody EnrollmentRequest request) {
        EnrolledIn enrollment = service.enrollPrisoner(request.getPrisonerId(), request.getCourseId());
        return ResponseEntity.ok(enrollment);
    }

    @PostMapping("/certificates")
    public ResponseEntity<OwnCertificateFrom> issueCertificate(@RequestBody EnrollmentRequest request) {
        OwnCertificateFrom certificate = service.issueCertificate(request.getPrisonerId(), request.getCourseId());
        return ResponseEntity.ok(certificate);
    }

    @GetMapping("/enrollments")
    public ResponseEntity<List<EnrolledIn>> getEnrollments() {
        List<EnrolledIn> enrollments = service.getAllEnrollments();
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<OwnCertificateFrom>> getCertificates() {
        List<OwnCertificateFrom> certificates = service.getAllCertificates();
        return ResponseEntity.ok(certificates);
    }

    @DeleteMapping("/enrollments/{prisonerId}/{courseId}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Integer prisonerId,
                                                 @PathVariable Integer courseId) {
        service.deleteEnrollment(prisonerId, courseId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/certificates/{prisonerId}/{courseId}")
    public ResponseEntity<Void> deleteCertificate(@PathVariable Integer prisonerId,
                                                  @PathVariable Integer courseId) {
        service.deleteCertificate(prisonerId, courseId);
        return ResponseEntity.noContent().build();
    }
    @Data
    public static class EnrollmentRequest {
        private Integer prisonerId;
        private Integer courseId;
    }
}
