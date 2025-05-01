package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.OwnCertificateFromKey;
import com.example.PrisonManagement.Model.VisitedBy;
import com.example.PrisonManagement.Model.VisitedByKey;
import com.example.PrisonManagement.Repository.VisitedByRepository;
import com.example.PrisonManagement.Service.VisitedByService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

// VisitedByServiceImpl.java
@Service
@Transactional
public class VisitedByServiceImpl implements VisitedByService {

    private static final Logger logger = LoggerFactory.getLogger(VisitedByServiceImpl.class);
    private final VisitedByRepository visitedByRepository;

    @Autowired
    public VisitedByServiceImpl(VisitedByRepository visitedByRepository) {
        this.visitedByRepository = visitedByRepository;
        logger.info("Initialized VisitedByServiceImpl with repository: {}", visitedByRepository.getClass().getSimpleName());
    }

    @Override
    @Transactional
    public List<VisitedBy> findAll() {
        logger.debug("Fetching all VisitedBy entries");
        List<VisitedBy> list = visitedByRepository.findAll();
        logger.info("Fetched {} VisitedBy entries", list.size());
        return list;
    }

    @Override
    @Transactional
    public VisitedBy findById(VisitedByKey key) {
        logger.debug("Finding VisitedBy with key={}", key);
        return visitedByRepository.findById(key)
                .orElseThrow(() -> {
                    logger.warn("VisitedBy with key={} not found", key);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "VisitedBy with key " + key + " not found");
                });
    }

    @Override
    public VisitedBy create(VisitedBy visitedBy) {
        VisitedByKey key = visitedBy.getId();
        logger.debug("Creating VisitedBy entry with key={}", key);
        if (visitedByRepository.existsById(key)) {
            logger.warn("Conflict: VisitedBy with key={} already exists", key);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "VisitedBy with key " + key + " already exists");
        }
        VisitedBy saved = visitedByRepository.save(visitedBy);
        logger.info("Created VisitedBy entry with key={}", key);
        return saved;
    }

    @Override
    public VisitedBy update(Integer prisonerId, Integer visitorId, VisitedBy visitedBy) {
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        logger.debug("Updating VisitedBy entry with key={}", key);
        if (!visitedByRepository.existsById(key)) {
            logger.warn("VisitedBy with key={} not found for update", key);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "VisitedBy with key " + key + " not found");
        }
        visitedBy.setId(key);
        VisitedBy updated = visitedByRepository.save(visitedBy);
        logger.info("Updated VisitedBy entry with key={}", key);
        return updated;
    }

    @Override
    public void deleteById(VisitedByKey key) {
        logger.debug("Deleting VisitedBy entry with key={}", key);
        if (!visitedByRepository.existsById(key)) {
            logger.warn("VisitedBy with key={} not found for deletion", key);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "VisitedBy with key " + key + " not found");
        }
        visitedByRepository.deleteById(key);
        logger.info("Deleted VisitedBy entry with key={}", key);
    }

    @Override
    @Transactional
    public boolean existsById(VisitedByKey key) {
        logger.debug("Checking existence of VisitedBy with key={}", key);
        boolean exists = visitedByRepository.existsById(key);
        logger.info("Existence check for VisitedBy {}: {}", key, exists);
        return exists;
    }
}
