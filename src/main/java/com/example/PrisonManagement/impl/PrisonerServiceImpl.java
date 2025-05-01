package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Service.PrisonerService;
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
public class PrisonerServiceImpl implements PrisonerService {

    private static final Logger logger = LoggerFactory.getLogger(PrisonerServiceImpl.class);
    private final PrisonerRepository repo;

    @Autowired
    public PrisonerServiceImpl(PrisonerRepository repo) {
        this.repo = repo;
        logger.info("Initialized PrisonerServiceImpl with repository: {}", repo.getClass().getSimpleName());
    }

    @Override
    @Transactional
    public List<Prisoner> getAll() {
        logger.debug("Fetching all prisoners");
        List<Prisoner> prisoners = repo.findAll();
        logger.info("Fetched {} prisoners", prisoners.size());
        return prisoners;
    }

    @Override
    @Transactional
    public Prisoner findById(Integer id) {
        logger.debug("Finding prisoner with id={}", id);
        return repo.findByPrisonerId(id)
                .orElseThrow(() -> {
                    logger.warn("Prisoner with id={} not found", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Заключённый с id=" + id + " не найден");
                });
    }

    @Override
    public Prisoner create(Prisoner prisoner) {
        Integer id = prisoner.getPrisonerId();
        logger.debug("Creating prisoner with id={}", id);
        if (repo.existsByPrisonerId(id)) {
            logger.warn("Conflict: prisoner with id={} already exists", id);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Заключённый с id=" + id + " уже существует");
        }
        Prisoner saved = repo.save(prisoner);
        logger.info("Created prisoner with id={}", saved.getPrisonerId());
        return saved;
    }

    @Override
    public Prisoner update(Integer id, Prisoner prisoner) {
        logger.debug("Updating prisoner with id={}", id);
        Prisoner existing = findById(id);
        existing.setFirstName(prisoner.getFirstName());
        existing.setLastName(prisoner.getLastName());
        existing.setBirthPlace(prisoner.getBirthPlace());
        existing.setDateOfBirth(prisoner.getDateOfBirth());
        existing.setOccupation(prisoner.getOccupation());
        existing.setIndictment(prisoner.getIndictment());
        existing.setIntakeDate(prisoner.getIntakeDate());
        existing.setSentenceEndDate(prisoner.getSentenceEndDate());
        existing.setCell(prisoner.getCell());
        existing.setSecurityLevel(prisoner.getSecurityLevel());
        existing.setReleased(prisoner.getReleased());
        Prisoner updated = repo.save(existing);
        logger.info("Updated prisoner with id={}", id);
        return updated;
    }

    @Override
    public void delete(Integer id) {
        logger.debug("Deleting prisoner with id={}", id);
        if (!repo.existsByPrisonerId(id)) {
            logger.warn("Attempt to delete non-existent prisoner with id={}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Заключённый с id=" + id + " не найден");
        }
        repo.deleteByPrisonerId(id);
        logger.info("Deleted prisoner with id={}", id);
    }
}
