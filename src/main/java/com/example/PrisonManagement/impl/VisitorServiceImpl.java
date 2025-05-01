package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Visitor;
import com.example.PrisonManagement.Repository.VisitorRepository;
import com.example.PrisonManagement.Service.VisitorService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VisitorServiceImpl implements VisitorService {

    private static final Logger logger = LoggerFactory.getLogger(VisitorServiceImpl.class);
    private final VisitorRepository repo;

    @Autowired
    public VisitorServiceImpl(VisitorRepository repo) {
        this.repo = repo;
        logger.info("Initialized VisitorServiceImpl with repository: {}", repo.getClass().getSimpleName());
    }

    @Override
    @Transactional
    public List<Visitor> findAll() {
        logger.debug("Fetching all visitors");
        List<Visitor> visitors = repo.findAll();
        logger.info("Fetched {} visitors", visitors.size());
        return visitors;
    }

    @Override
    @Transactional
    public Visitor findById(Integer id) {
        logger.debug("Finding visitor with id={}", id);
        return repo.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Visitor with id={} not found", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Visitor with id=" + id + " not found");
                });
    }

    @Override
    public Visitor create(Visitor visitor) {
        String phone = visitor.getPhoneNumber();
        logger.debug("Creating visitor with phoneNumber={}", phone);
        if (repo.existsByPhoneNumber(phone)) {
            logger.warn("Conflict: phone number {} is already registered", phone);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Phone number " + phone + " is already registered");
        }
        Visitor saved = repo.save(visitor);
        logger.info("Created visitor with id={} and phoneNumber={}", saved.getVisitorId(), phone);
        return saved;
    }

    @Override
    public Visitor update(Integer id, Visitor visitor) {
        logger.debug("Updating visitor with id={}", id);
        Visitor existing = findById(id);
        existing.setFirstName(visitor.getFirstName());
        existing.setLastName(visitor.getLastName());
        existing.setPhoneNumber(visitor.getPhoneNumber());
        existing.setRelationToPrisoner(visitor.getRelationToPrisoner());
        existing.setVisitDate(visitor.getVisitDate());
        Visitor updated = repo.save(existing);
        logger.info("Updated visitor with id={}", id);
        return updated;
    }

    @Override
    public void delete(Integer id) {
        logger.debug("Deleting visitor with id={}", id);
        if (!repo.existsById(id)) {
            logger.warn("Attempt to delete non-existent visitor with id={}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Visitor with id=" + id + " not found");
        }
        repo.deleteById(id);
        logger.info("Deleted visitor with id={}", id);
    }
}
