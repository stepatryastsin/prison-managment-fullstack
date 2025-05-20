package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.EnrolledInKey;
import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Model.OwnCertificateFromKey;
import com.example.PrisonManagement.Repository.EnrolledInDao;
import com.example.PrisonManagement.Repository.OwnCertificateFromDao;
import com.example.PrisonManagement.Service.OwnCertificateFromService;
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
public class OwnCertificateFromServiceImpl implements OwnCertificateFromService {

    private static final Logger logger = LoggerFactory.getLogger(OwnCertificateFromServiceImpl.class);

    private final OwnCertificateFromDao certRepo;
    private final EnrolledInDao enrollRepo;

    public OwnCertificateFromServiceImpl(OwnCertificateFromDao certRepo,
                                         EnrolledInDao enrollRepo) {
        this.certRepo   = Objects.requireNonNull(certRepo, "OwnCertificateFromDao must not be null");
        this.enrollRepo = Objects.requireNonNull(enrollRepo,   "EnrolledInDao must not be null");
        logger.info("OwnCertificateFromServiceImpl initialized");
    }

    @Override
    public List<OwnCertificateFrom> findAll() {
        logger.info("Fetching all certificates");
        List<OwnCertificateFrom> all = certRepo.findAll();
        logger.info("Found {} certificates", all.size());
        return all;
    }

    @Override
    public OwnCertificateFrom findById(Integer prisonerId, Integer courseId) {
        var key = new OwnCertificateFromKey(prisonerId, courseId);
        logger.info("Fetching certificate {}", key);
        return certRepo.findById(key)
                .orElseThrow(() -> {
                    logger.warn("Certificate {} not found", key);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Certificate " + key + " not found");
                });
    }

    @Override
    public OwnCertificateFrom create(OwnCertificateFrom entity) {
        Objects.requireNonNull(entity, "Certificate must not be null");
        var key = entity.getId();
        logger.info("Creating certificate {}", key);
        if (certRepo.existsById(key)) {
            logger.warn("Certificate {} already exists", key);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Certificate " + key + " already exists");
        }
        return certRepo.create(entity);
    }

    @Override
    public OwnCertificateFrom update(Integer prisonerId, Integer courseId, OwnCertificateFrom entity) {
        var key = new OwnCertificateFromKey(prisonerId, courseId);
        logger.info("Updating certificate {}", key);
        if (!certRepo.existsById(key)) {
            logger.warn("Certificate {} not found for update", key);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Certificate " + key + " not found");
        }
        entity.setId(key);
        return certRepo.update(entity);
    }

    @Override
    public void delete(Integer prisonerId, Integer courseId) {
        var key = new OwnCertificateFromKey(prisonerId, courseId);
        logger.info("Deleting certificate {}", key);
        if (!certRepo.existsById(key)) {
            logger.warn("Certificate {} not found", key);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Certificate " + key + " not found");
        }
        certRepo.deleteByPrisonerIdAndCourseId(prisonerId, courseId);
        logger.info("Certificate {} deleted", key);

        // удаляем остаточные зачисления
        EnrolledInKey enKey = new EnrolledInKey(prisonerId, courseId);
        if (enrollRepo.existsById(enKey)) {
            enrollRepo.deleteByPrisonerIdAndCourseId(prisonerId, courseId);
            logger.info("Leftover enrollment {} also deleted", enKey);
        }
    }
}
