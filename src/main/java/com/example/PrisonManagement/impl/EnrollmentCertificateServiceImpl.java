package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.*;
import com.example.PrisonManagement.Repository.EnrolledInDao;
import com.example.PrisonManagement.Repository.OwnCertificateFromDao;
import com.example.PrisonManagement.Repository.PrisonerDao;
import com.example.PrisonManagement.Repository.ProgramsAndCoursesDao;
import com.example.PrisonManagement.Service.EnrollmentCertificateServiceInterface;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;


@Service
@Transactional
public class EnrollmentCertificateServiceImpl implements EnrollmentCertificateServiceInterface {

    private static final Logger logger = LoggerFactory.getLogger(EnrollmentCertificateServiceImpl.class);

    private final EnrolledInDao enrollDao;
    private final OwnCertificateFromDao certDao;
    private final PrisonerDao prisonerDao;
    private final ProgramsAndCoursesDao courseDao;

    public EnrollmentCertificateServiceImpl(
            EnrolledInDao enrollDao,
            OwnCertificateFromDao certDao,
            PrisonerDao prisonerDao,
            ProgramsAndCoursesDao courseDao) {
        this.enrollDao   = Objects.requireNonNull(enrollDao,   "EnrolledInDao must not be null");
        this.certDao     = Objects.requireNonNull(certDao,     "OwnCertificateFromDao must not be null");
        this.prisonerDao = Objects.requireNonNull(prisonerDao, "PrisonerDao must not be null");
        this.courseDao   = Objects.requireNonNull(courseDao,   "ProgramsAndCoursesDao must not be null");
        logger.info("EnrollmentCertificateServiceImpl initialized");
    }

    @Override
    public List<EnrolledIn> getAllEnrollments() {
        logger.info("Запрошен список всех зачислений");
        List<EnrolledIn> list = enrollDao.findAll();
        logger.info("Найдено {} зачислений", list.size());
        return list;
    }

    @Override
    public EnrolledIn enrollPrisoner(Integer prisonerId, Integer courseId) {
        logger.info("Попытка зачислить Prisoner={} на Course={}", prisonerId, courseId);

        var prisoner = prisonerDao.findById(prisonerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Prisoner " + prisonerId + " not found"));
        var course = courseDao.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Course " + courseId + " not found"));

        EnrolledInKey key = new EnrolledInKey(prisonerId, courseId);
        if (enrollDao.existsById(key)) {
            logger.warn("Невозможно зачислить — {} уже существует", key);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Enrollment " + key + " already exists");
        }

        EnrolledIn e = new EnrolledIn(prisoner, course);
        EnrolledIn saved = enrollDao.create(e);
        logger.info("Успешно зачислен: {}", key);
        return saved;
    }

    @Override
    public void deleteEnrollment(Integer prisonerId, Integer courseId) {
        EnrolledInKey key = new EnrolledInKey(prisonerId, courseId);
        logger.info("Попытка удалить зачисление {}", key);
        if (!enrollDao.existsById(key)) {
            logger.warn("Зачисление {} не найдено для удаления", key);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Enrollment " + key + " not found");
        }
        enrollDao.deleteByPrisonerIdAndCourseId(prisonerId, courseId);
        logger.info("Зачисление {} удалено", key);
    }

    @Override
    public List<OwnCertificateFrom> getAllCertificates() {
        logger.info("Запрошен список всех сертификатов");
        List<OwnCertificateFrom> list = certDao.findAll();
        logger.info("Найдено {} сертификатов", list.size());
        return list;
    }

    @Override
    public OwnCertificateFrom issueCertificate(Integer prisonerId, Integer courseId) {
        logger.info("Попытка выдать сертификат Prisoner={} Course={}", prisonerId, courseId);

        var prisoner = prisonerDao.findById(prisonerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Prisoner " + prisonerId + " not found"));
        var course = courseDao.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Course " + courseId + " not found"));

        var key = new OwnCertificateFromKey(prisonerId, courseId);
        if (certDao.existsById(key)) {
            logger.warn("Невозможно выдать — сертификат {} уже существует", key);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Certificate " + key + " already exists");
        }

        OwnCertificateFrom cert = new OwnCertificateFrom(prisoner, course);
        OwnCertificateFrom saved = certDao.create(cert);
        logger.info("Сертификат {} выдан", key);
        return saved;
    }

    @Override
    public void deleteCertificate(Integer prisonerId, Integer courseId) {
        var certKey = new OwnCertificateFromKey(prisonerId, courseId);
        logger.info("Попытка удалить сертификат {}", certKey);
        if (!certDao.existsById(certKey)) {
            logger.warn("Сертификат {} не найден", certKey);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Certificate " + certKey + " not found");
        }
        certDao.deleteByPrisonerIdAndCourseId(prisonerId, courseId);
        logger.info("Сертификат {} удалён", certKey);

        // Если остался enrollment — удаляем его
        EnrolledInKey enrollKey = new EnrolledInKey(prisonerId, courseId);
        if (enrollDao.existsById(enrollKey)) {
            enrollDao.deleteByPrisonerIdAndCourseId(prisonerId, courseId);
            logger.info("Соответствующее зачисление {} удалено", enrollKey);
        }
    }
}

