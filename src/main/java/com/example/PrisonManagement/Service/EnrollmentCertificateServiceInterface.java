package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.EnrolledIn;
import com.example.PrisonManagement.Model.OwnCertificateFrom;
import java.util.List;

public interface EnrollmentCertificateServiceInterface {
    EnrolledIn enrollPrisoner(Integer prisonerId, Integer courseId);
    OwnCertificateFrom issueCertificate(Integer prisonerId, Integer courseId);
    List<EnrolledIn> getAllEnrollments();
    List<OwnCertificateFrom> getAllCertificates();
    void deleteEnrollment(Integer prisonerId, Integer courseId);
    void deleteCertificate(Integer prisonerId, Integer courseId);
}