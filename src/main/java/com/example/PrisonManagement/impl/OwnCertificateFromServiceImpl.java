package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.EnrolledInKey;
import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Model.OwnCertificateFromKey;
import com.example.PrisonManagement.Repository.EnrolledInRepository;
import com.example.PrisonManagement.Repository.OwnCertificateFromRepository;
import com.example.PrisonManagement.Service.OwnCertificateFromService;
import jakarta.persistence.EntityNotFoundException;
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
    private final OwnCertificateFromRepository certRepo;
    private final EnrolledInRepository enrollRepo;

    @Autowired
    public OwnCertificateFromServiceImpl(OwnCertificateFromRepository certRepo,
                                         EnrolledInRepository enrollRepo) {
        this.certRepo = Objects.requireNonNull(certRepo, "OwnCertificateFromRepository must not be null");
        this.enrollRepo = Objects.requireNonNull(enrollRepo, "EnrolledInRepository must not be null");
        logger.info("Initialized OwnCertificateFromServiceImpl with certRepo: {} and enrollRepo: {}",
                certRepo.getClass().getSimpleName(), enrollRepo.getClass().getSimpleName());
    }

    @Override
    @Transactional
    public List<OwnCertificateFrom> findAll() {
        logger.debug("Fetching all certificates");
        List<OwnCertificateFrom> all = certRepo.findAll();
        logger.info("Fetched {} certificates", all.size());
        return all;
    }

    @Override
    @Transactional
    public OwnCertificateFrom findById(Integer prisonerId, Integer courseId) {
        validateIds(prisonerId, courseId);
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        logger.debug("Finding certificate with key={}", key);
        return certRepo.findById(key)
                .orElseThrow(() -> {
                    logger.warn("Certificate with key={} not found", key);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Certificate " + key + " not found");
                });
    }

    @Override
    public OwnCertificateFrom create(OwnCertificateFrom ownCertificate) {
        Objects.requireNonNull(ownCertificate, "OwnCertificateFrom must not be null");
        OwnCertificateFromKey key = ownCertificate.getId();
        validateKey(key);
        logger.debug("Creating certificate with key={}", key);
        if (certRepo.existsById(key)) {
            logger.warn("Conflict: certificate with key={} already exists", key);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Certificate " + key + " already exists");
        }
        OwnCertificateFrom saved = certRepo.save(ownCertificate);
        logger.info("Created certificate with key={}", key);
        return saved;
    }

    @Override
    public OwnCertificateFrom update(Integer prisonerId, Integer courseId, OwnCertificateFrom ownCertificate) {
        validateIds(prisonerId, courseId);
        Objects.requireNonNull(ownCertificate, "OwnCertificateFrom must not be null");
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        logger.debug("Updating certificate with key={}", key);
        if (!certRepo.existsById(key)) {
            logger.warn("Certificate with key={} not found for update", key);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Certificate " + key + " not found");
        }
        ownCertificate.setId(key);
        OwnCertificateFrom updated = certRepo.save(ownCertificate);
        logger.info("Updated certificate with key={}", key);
        return updated;
    }

    @Override
    public void delete(Integer prisonerId, Integer courseId) {
        validateIds(prisonerId, courseId);
        OwnCertificateFromKey certKey = new OwnCertificateFromKey(prisonerId, courseId);
        logger.debug("Deleting certificate with key={}", certKey);
        OwnCertificateFrom cert = certRepo.findById(certKey)
                .orElseThrow(() -> {
                    logger.warn("Certificate with key={} not found for deletion", certKey);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Certificate " + certKey + " not found");
                });
        certRepo.delete(cert);
        logger.info("Deleted certificate with key={}", certKey);

        // Also remove any leftover enrollment
        EnrolledInKey enrollKey = new EnrolledInKey(prisonerId, courseId);
        logger.debug("Checking for leftover enrollment with key={}", enrollKey);
        enrollRepo.findById(enrollKey).ifPresent(enrollment -> {
            enrollRepo.delete(enrollment);
            logger.info("Deleted leftover enrollment with key={}", enrollKey);
        });
    }

    private void validateIds(Integer prisonerId, Integer courseId) {
        if (prisonerId == null || courseId == null) {
            logger.error("Invalid IDs provided: prisonerId={}, courseId={}", prisonerId, courseId);
            throw new IllegalArgumentException("prisonerId and courseId must not be null");
        }
    }

    private void validateKey(OwnCertificateFromKey key) {
        if (key == null || key.getPrisonerId() == null || key.getCourseId() == null) {
            logger.error("Invalid certificate key provided: {}", key);
            throw new IllegalArgumentException("OwnCertificateFromKey and its fields must not be null");
        }
    }
}