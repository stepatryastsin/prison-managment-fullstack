package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.*;
import com.example.PrisonManagement.Repository.EnrolledInRepository;
import com.example.PrisonManagement.Repository.OwnCertificateFromRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Repository.ProgramsAndCoursesRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;



@Service
@Transactional
public class EnrollmentCertificateService {

    private final EnrolledInRepository      enrollRepo;
    private final OwnCertificateFromRepository certRepo;
    private final PrisonerRepository        prisonerRepo;
    private final ProgramsAndCoursesRepository courseRepo;

    @Autowired
    public EnrollmentCertificateService(
            EnrolledInRepository enrollRepo,
            OwnCertificateFromRepository certRepo,
            PrisonerRepository prisonerRepo,
            ProgramsAndCoursesRepository courseRepo) {
        this.enrollRepo   = enrollRepo;
        this.certRepo     = certRepo;
        this.prisonerRepo = prisonerRepo;
        this.courseRepo   = courseRepo;
    }

    public List<EnrolledIn> findAllEnrollments() {
        return enrollRepo.findAll();
    }

    public EnrolledIn findEnrollment(Integer prisonerId, Integer courseId) {
        EnrolledInKey key = new EnrolledInKey(prisonerId, courseId);
        return enrollRepo.findById(key)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Enrollment " + key + " not found"));
    }

    public EnrolledIn enrollPrisoner(EnrolledIn enrollmentDto) {
        EnrolledInKey key = enrollmentDto.getId();

        Prisoner prisoner = prisonerRepo.getReferenceById(key.getPrisonerId());
        ProgramsAndCourses course = courseRepo.getReferenceById(key.getCourseId());

        EnrolledIn enrollment = new EnrolledIn(prisoner, course);

        if (enrollRepo.existsById(enrollment.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Enrollment " + enrollment.getId() + " already exists");
        }
        return enrollRepo.save(enrollment);
    }

    public void deleteEnrollment(Integer prisonerId, Integer courseId) {
        int deleted = enrollRepo.deleteByPrisonerIdAndCourseId(prisonerId, courseId);
        if (deleted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Enrollment (" + prisonerId + "," + courseId + ") not found");
        }
    }


    public List<OwnCertificateFrom> findAllCertificates() {
        return certRepo.findAll();
    }

    public OwnCertificateFrom findCertificate(Integer prisonerId, Integer courseId) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        return certRepo.findById(key)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate " + key + " not found"));
    }

    public OwnCertificateFrom issueCertificate(OwnCertificateFrom certificateDto) {
        OwnCertificateFromKey key = certificateDto.getId();

        Prisoner prisoner = prisonerRepo.getReferenceById(key.getPrisonerId());
        ProgramsAndCourses course = courseRepo.getReferenceById(key.getCourseId());

        OwnCertificateFrom certificate = new OwnCertificateFrom(prisoner, course);

        if (certRepo.existsById(certificate.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Certificate " + certificate.getId() + " already exists");
        }
        return certRepo.save(certificate);
    }

    public void deleteCertificate(Integer prisonerId, Integer courseId) {
        OwnCertificateFromKey certKey = new OwnCertificateFromKey(prisonerId, courseId);
        OwnCertificateFrom cert = certRepo.findById(certKey)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Certificate " + certKey + " not found"
                ));
        certRepo.delete(cert);

        EnrolledInKey enrollKey = new EnrolledInKey(prisonerId, courseId);
        enrollRepo.findById(enrollKey).ifPresent(enrollRepo::delete);
    }
}