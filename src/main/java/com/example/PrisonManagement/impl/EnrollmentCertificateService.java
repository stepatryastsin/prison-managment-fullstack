package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.*;
import com.example.PrisonManagement.Repository.EnrolledInRepository;
import com.example.PrisonManagement.Repository.OwnCertificateFromRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Repository.ProgramsAndCoursesRepository;
import com.example.PrisonManagement.Service.EnrollmentCertificateServiceInterface;
import jakarta.persistence.EntityNotFoundException;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;



@Service
@Transactional
public class EnrollmentCertificateService implements EnrollmentCertificateServiceInterface {
    private final Logger logger = LoggerFactory.getLogger(EnrollmentCertificateService.class);
    private final EnrolledInRepository enrolledInRepository;
    private final OwnCertificateFromRepository ownCertificateFromRepository;
    private final PrisonerRepository prisonerRepository;
    private final ProgramsAndCoursesRepository programsAndCoursesRepository;

    @Autowired
    public EnrollmentCertificateService(EnrolledInRepository enrolledInRepository,
                                        OwnCertificateFromRepository ownCertificateFromRepository,
                                        PrisonerRepository prisonerRepository,
                                        ProgramsAndCoursesRepository programsAndCoursesRepository) {
        this.enrolledInRepository = enrolledInRepository;
        this.ownCertificateFromRepository = ownCertificateFromRepository;
        this.prisonerRepository = prisonerRepository;
        this.programsAndCoursesRepository = programsAndCoursesRepository;
    }

    @Override
    public EnrolledIn enrollPrisoner(Integer prisonerId, Integer courseId) {
        logger.info("Регистрация заключенного с id {} на курс с id {}", prisonerId, courseId);
        Prisoner prisoner = prisonerRepository.findById(prisonerId)
                .orElseThrow(() -> new EntityNotFoundException("Заключённый с id " + prisonerId + " не найден"));
        ProgramsAndCourses course = programsAndCoursesRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Курс с id " + courseId + " не найден"));

        EnrolledInKey key = new EnrolledInKey(prisonerId, courseId);
        EnrolledIn enrollment = new EnrolledIn(key, prisoner, course);
        return enrolledInRepository.save(enrollment);
    }

    @Override
    public OwnCertificateFrom issueCertificate(Integer prisonerId, Integer courseId) {
        logger.info("Выдача сертификата заключенному с id {} по курсу с id {}", prisonerId, courseId);
        Prisoner prisoner = prisonerRepository.findById(prisonerId)
                .orElseThrow(() -> new EntityNotFoundException("Заключённый с id " + prisonerId + " не найден"));
        ProgramsAndCourses course = programsAndCoursesRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Курс с id " + courseId + " не найден"));

        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        OwnCertificateFrom certificate = new OwnCertificateFrom(key, prisoner, course);
        return ownCertificateFromRepository.save(certificate);
    }

    @Override
    public List<EnrolledIn> getAllEnrollments() {
        logger.info("Получение списка всех регистраций");
        return enrolledInRepository.findAll();
    }

    @Override
    public List<OwnCertificateFrom> getAllCertificates() {
        logger.info("Получение списка всех сертификатов");
        return ownCertificateFromRepository.findAll();
    }

    @Override
    public void deleteEnrollment(Integer prisonerId, Integer courseId) {
        logger.info("Удаление регистрации для заключенного с id {} и курса с id {}", prisonerId, courseId);
        EnrolledInKey key = new EnrolledInKey(prisonerId, courseId);
        if (enrolledInRepository.existsById(key)) {
            enrolledInRepository.deleteById(key);
        } else {
            logger.error("Регистрация с ключом ({}, {}) не найдена", prisonerId, courseId);
            throw new EntityNotFoundException("Регистрация с ключом (" + prisonerId + ", " + courseId + ") не найдена");
        }
    }

    @Override
    public void deleteCertificate(Integer prisonerId, Integer courseId) {
        logger.info("Удаление сертификата для заключенного с id {} и курса с id {}", prisonerId, courseId);
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        if (ownCertificateFromRepository.existsById(key)) {
            ownCertificateFromRepository.deleteById(key);
        } else {
            logger.error("Сертификат с ключом ({}, {}) не найден", prisonerId, courseId);
            throw new EntityNotFoundException("Сертификат с ключом (" + prisonerId + ", " + courseId + ") не найден");
        }
    }
}