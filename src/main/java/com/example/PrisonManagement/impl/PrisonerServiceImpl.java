package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Repository.*;
import com.example.PrisonManagement.Service.PrisonerService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class PrisonerServiceImpl implements PrisonerService {

    private static final Logger logger = LoggerFactory.getLogger(PrisonerServiceImpl.class);

    private final PrisonerRepository repo;
    private final BorrowedRepository borrowedRepo;
    private final InfirmaryRepository infirmaryRepo;
    private final PrisonerLaborRepository laborRepo;
    private final PropertiesInCellsRepository propertiesRepo;

    @Autowired
    public PrisonerServiceImpl(PrisonerRepository repo,
                               BorrowedRepository borrowedRepo,
                               InfirmaryRepository infirmaryRepo,
                               PrisonerLaborRepository laborRepo,
                               PropertiesInCellsRepository propertiesRepo) {
        this.repo           = repo;
        this.borrowedRepo   = borrowedRepo;
        this.infirmaryRepo  = infirmaryRepo;
        this.laborRepo      = laborRepo;
        this.propertiesRepo = propertiesRepo;
        logger.info("Initialized PrisonerServiceImpl with repositories");
    }

    @Override
    public List<Prisoner> getAll() {
        logger.debug("Fetching all prisoners");
        List<Prisoner> prisoners = repo.findAll();
        logger.info("Fetched {} prisoners", prisoners.size());
        return prisoners;
    }

    @Override
    public Prisoner findById(Integer id) {
        logger.debug("Finding prisoner with id={}", id);
        return repo.findByPrisonerId(id)
                .orElseThrow(() -> {
                    logger.warn("Prisoner with id={} not found", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Заключённый с id=" + id + " не найден"
                    );
                });
    }

    @Override
    public Prisoner create(Prisoner prisoner) {
        Integer id = prisoner.getPrisonerId();
        logger.debug("Creating prisoner with id={}", id);
        if (repo.existsByPrisonerId(id)) {
            logger.warn("Conflict: prisoner with id={} already exists", id);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Заключённый с id=" + id + " уже существует"
            );
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
    public void delete(Integer prisonerId) {
        // собираем количество связанных записей
        long borrowedCount    = borrowedRepo.countByPrisoner_PrisonerId(prisonerId);
        long infirmaryCount   = infirmaryRepo.countByPrisoner_PrisonerId(prisonerId);
        long laborCount       = laborRepo.countByPrisoner_PrisonerId(prisonerId);
        long propertiesCount  = propertiesRepo.countByPrisoner_PrisonerId(prisonerId);

        Map<String, Long> counts = Map.of(
                "borrowed",              borrowedCount,
                "infirmary",             infirmaryCount,
                "prisoner_labor",        laborCount,
                "properties_in_cells",   propertiesCount
        );

        Map<String, Long> nonZero = counts.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        if (!nonZero.isEmpty()) {
            String details = nonZero.entrySet().stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining(", "));
            logger.warn("Cannot delete prisoner id={} due to related records: {}", prisonerId, details);
            throw new IllegalStateException(
                    "Нельзя удалить заключённого с ID=" + prisonerId +
                            ", найдены связанные записи: " + details
            );
        }

        repo.deleteByPrisonerId(prisonerId);
        logger.info("Deleted prisoner with id={}", prisonerId);
    }
}