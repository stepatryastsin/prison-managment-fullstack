package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;
import com.example.PrisonManagement.Repository.PropertiesInCellsRepository;
import com.example.PrisonManagement.Service.PropertiesInCellsService;
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
public class PropertiesInCellsServiceImpl implements PropertiesInCellsService {

    private static final Logger logger = LoggerFactory.getLogger(PropertiesInCellsServiceImpl.class);
    private final PropertiesInCellsRepository repository;

    @Autowired
    public PropertiesInCellsServiceImpl(PropertiesInCellsRepository repository) {
        this.repository = Objects.requireNonNull(repository, "PropertiesInCellsRepository must not be null");
        logger.info("Initialized PropertiesInCellsServiceImpl with repository: {}", repository.getClass().getSimpleName());
    }

    @Override
    @Transactional
    public List<PropertiesInCells> findAll() {
        logger.debug("Starting fetch of all PropertiesInCells entries");
        List<PropertiesInCells> list = repository.findAll();
        logger.info("Fetched {} PropertiesInCells entries", list.size());
        return list;
    }

    @Override
    @Transactional
    public PropertiesInCells findById(PropertiesInCellsKey id) {
        validateKey(id);
        logger.debug("Finding PropertiesInCells entry with key={}", id);
        return repository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("PropertiesInCells entry not found for key={}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Property not found for key: " + id);
                });
    }

    @Override
    public PropertiesInCells create(PropertiesInCells properties) {
        Objects.requireNonNull(properties, "PropertiesInCells must not be null");
        PropertiesInCellsKey key = properties.getId();
        validateKey(key);
        logger.debug("Creating PropertiesInCells entry with key={}", key);
        if (repository.existsById(key)) {
            logger.warn("Conflict: PropertiesInCells entry already exists for key={}", key);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Property already exists for key: " + key);
        }
        PropertiesInCells saved = repository.save(properties);
        logger.info("Created PropertiesInCells entry with key={}", key);
        return saved;
    }

    @Override
    public PropertiesInCells update(PropertiesInCellsKey id, PropertiesInCells properties) {
        Objects.requireNonNull(properties, "PropertiesInCells must not be null");
        validateKey(id);
        logger.debug("Updating PropertiesInCells entry with key={}", id);
        if (!repository.existsById(id)) {
            logger.warn("Cannot update non-existent PropertiesInCells entry for key={}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Cannot update non-existent property with key: " + id);
        }
        properties.setId(id);
        PropertiesInCells updated = repository.save(properties);
        logger.info("Updated PropertiesInCells entry with key={}", id);
        return updated;
    }

    @Override
    public void delete(PropertiesInCellsKey id) {
        validateKey(id);
        logger.debug("Deleting PropertiesInCells entry with key={}", id);
        if (!repository.existsById(id)) {
            logger.warn("Cannot delete non-existent PropertiesInCells entry for key={}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Cannot delete non-existent property with key: " + id);
        }
        repository.deleteById(id);
        logger.info("Deleted PropertiesInCells entry with key={}", id);
    }

    @Override
    @Transactional
    public boolean existsById(PropertiesInCellsKey id) {
        validateKey(id);
        logger.debug("Checking existence of PropertiesInCells entry with key={}", id);
        boolean exists = repository.existsById(id);
        logger.info("Existence check for PropertiesInCells key={} returned {}", id, exists);
        return exists;
    }

    private void validateKey(PropertiesInCellsKey id) {
        if (id == null || id.getPrisonerId() == null) {
            logger.error("Invalid PropertiesInCellsKey provided: {}", id);
            throw new IllegalArgumentException("PropertiesInCellsKey and its fields must not be null");
        }
    }
}
