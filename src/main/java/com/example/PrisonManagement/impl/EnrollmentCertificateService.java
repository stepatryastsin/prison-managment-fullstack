package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.*;
import com.example.PrisonManagement.Repository.EnrolledInRepository;
import com.example.PrisonManagement.Repository.OwnCertificateFromRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Repository.ProgramsAndCoursesRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;



@Service
@Transactional
public class EnrollmentCertificateService {

    private static final Logger logger = LoggerFactory.getLogger(EnrollmentCertificateService.class);
    private final EnrolledInRepository enrollRepo;
    private final OwnCertificateFromRepository certRepo;
    private final PrisonerRepository prisonerRepo;
    private final ProgramsAndCoursesRepository courseRepo;

    @Autowired
    public EnrollmentCertificateService(
            EnrolledInRepository enrollRepo,
            OwnCertificateFromRepository certRepo,
            PrisonerRepository prisonerRepo,
            ProgramsAndCoursesRepository courseRepo) {
        this.enrollRepo = enrollRepo;
        this.certRepo = certRepo;
        this.prisonerRepo = prisonerRepo;
        this.courseRepo = courseRepo;
        logger.info("EnrollmentCertificateService инициализирован");
    }

    public List<EnrolledIn> findAllEnrollments() {
        logger.info("Запрошен список всех записей зачисления");
        List<EnrolledIn> list = enrollRepo.findAll();
        logger.info("Найдено {} записей зачисления", list.size());
        return list;
    }

    public EnrolledIn findEnrollment(Integer prisonerId, Integer courseId) {
        EnrolledInKey key = new EnrolledInKey(prisonerId, courseId);
        logger.info("Запрошена запись зачисления {}", key);
        return enrollRepo.findById(key)
                .map(e -> {
                    logger.info("Запись зачисления {} найдена", key);
                    return e;
                })
                .orElseThrow(() -> {
                    logger.warn("Запись зачисления {} не найдена", key);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Enrollment " + key + " not found");
                });
    }

    public EnrolledIn enrollPrisoner(EnrolledIn enrollmentDto) {
        EnrolledInKey key = enrollmentDto.getId();
        logger.info("Попытка зачислить заключённого {} на курс {}", key.getPrisonerId(), key.getCourseId());
        Prisoner prisoner = prisonerRepo.getReferenceById(key.getPrisonerId());
        ProgramsAndCourses course = courseRepo.getReferenceById(key.getCourseId());
        EnrolledIn enrollment = new EnrolledIn(prisoner, course);
        if (enrollRepo.existsById(enrollment.getId())) {
            logger.warn("Невозможно зачислить: запись {} уже exists", enrollment.getId());
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Enrollment " + enrollment.getId() + " already exists");
        }
        EnrolledIn saved = enrollRepo.save(enrollment);
        logger.info("Заключённый {} успешно зачислен на курс {}", key.getPrisonerId(), key.getCourseId());
        return saved;
    }

    public void deleteEnrollment(Integer prisonerId, Integer courseId) {
        logger.info("Попытка удалить зачисление ({},{})", prisonerId, courseId);
        int deleted = enrollRepo.deleteByPrisonerIdAndCourseId(prisonerId, courseId);
        if (deleted == 0) {
            logger.warn("Удаление зачисления ({},{}) не выполнено: не найдено", prisonerId, courseId);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Enrollment (" + prisonerId + "," + courseId + ") not found");
        }
        logger.info("Зачисление ({},{}) успешно удалено", prisonerId, courseId);
    }

    public List<OwnCertificateFrom> findAllCertificates() {
        logger.info("Запрошен список всех сертификатов");
        List<OwnCertificateFrom> list = certRepo.findAll();
        logger.info("Найдено {} сертификатов", list.size());
        return list;
    }

    public OwnCertificateFrom findCertificate(Integer prisonerId, Integer courseId) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        logger.info("Запрошен сертификат {}", key);
        return certRepo.findById(key)
                .map(c -> {
                    logger.info("Сертификат {} найден", key);
                    return c;
                })
                .orElseThrow(() -> {
                    logger.warn("Сертификат {} не найден", key);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Certificate " + key + " not found");
                });
    }

    public OwnCertificateFrom issueCertificate(OwnCertificateFrom certificateDto) {
        OwnCertificateFromKey key = certificateDto.getId();
        logger.info("Попытка выдать сертификат заключённому {} за курс {}", key.getPrisonerId(), key.getCourseId());
        Prisoner prisoner = prisonerRepo.getReferenceById(key.getPrisonerId());
        ProgramsAndCourses course = courseRepo.getReferenceById(key.getCourseId());
        OwnCertificateFrom certificate = new OwnCertificateFrom(prisoner, course);
        if (certRepo.existsById(certificate.getId())) {
            logger.warn("Невозможно выдать сертификат: сертификат {} уже существует", certificate.getId());
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Certificate " + certificate.getId() + " already exists");
        }
        OwnCertificateFrom saved = certRepo.save(certificate);
        logger.info("Сертификат {} успешно выдан", key);
        return saved;
    }

    public void deleteCertificate(Integer prisonerId, Integer courseId) {
        OwnCertificateFromKey certKey = new OwnCertificateFromKey(prisonerId, courseId);
        logger.info("Попытка удалить сертификат {}", certKey);
        OwnCertificateFrom cert = certRepo.findById(certKey)
                .orElseThrow(() -> {
                    logger.warn("Сертификат {} не найден", certKey);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Certificate " + certKey + " not found");
                });
        certRepo.delete(cert);
        logger.info("Сертификат {} успешно удалён", certKey);
        EnrolledInKey enrollKey = new EnrolledInKey(prisonerId, courseId);
        enrollRepo.findById(enrollKey).ifPresent(e -> {
            enrollRepo.delete(e);
            logger.info("Соответствующее зачисление {} также удалено", enrollKey);
        });
    }
}
