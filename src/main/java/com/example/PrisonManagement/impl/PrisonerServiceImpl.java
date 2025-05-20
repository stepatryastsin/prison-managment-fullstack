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

    private static final org.slf4j.Logger logger =
            org.slf4j.LoggerFactory.getLogger(PrisonerServiceImpl.class);

    private final PrisonerDao            dao;
    private final BorrowedRepository     borrowedRepo;
    private final InfirmaryDao           infirmaryDao;
    private final PrisonerLaborRepository laborRepo;
    private final PropertiesInCellsRepository propertiesRepo;

    @Autowired
    public PrisonerServiceImpl(PrisonerDao dao,
                               BorrowedRepository borrowedRepo,
                               InfirmaryDao infirmaryDao,
                               PrisonerLaborRepository laborRepo,
                               PropertiesInCellsRepository propertiesRepo) {
        this.dao            = dao;
        this.borrowedRepo   = borrowedRepo;
        this.infirmaryDao   = infirmaryDao;
        this.laborRepo      = laborRepo;
        this.propertiesRepo = propertiesRepo;
        logger.info("Initialized PrisonerServiceImpl with JDBC DAO");
    }

    @Override
    public List<Prisoner> getAll() {
        logger.debug("Fetching all prisoners via JDBC");
        return dao.findAll();
    }

    @Override
    public Prisoner findById(Integer id) {
        logger.debug("Fetching prisoner id={}", id);
        return dao.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Prisoner id={} not found", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Заключённый с id=" + id + " не найден"
                    );
                });
    }

    @Override
    public Prisoner create(Prisoner prisoner) {
        logger.debug("Creating prisoner id={}", prisoner.getPrisonerId());
        if (dao.existsById(prisoner.getPrisonerId())) {
            logger.warn("Conflict: prisoner id={} already exists",
                    prisoner.getPrisonerId());
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Заключённый с id=" + prisoner.getPrisonerId() + " уже существует"
            );
        }
        return dao.create(prisoner);
    }

    @Override
    public Prisoner update(Integer id, Prisoner prisoner) {
        logger.debug("Updating prisoner id={}", id);
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
        return dao.update(existing);
    }

    @Override
    public void delete(Integer prisonerId) {
        long borrowed  = borrowedRepo.countByPrisoner_PrisonerId(prisonerId);
        long infirmary = infirmaryDao.countByPrisonerId(prisonerId);
        long labor     = laborRepo.countByPrisoner_PrisonerId(prisonerId);
        long props     = propertiesRepo.countByPrisoner_PrisonerId(prisonerId);

        Map<String, Long> counts = Map.of(
                "borrowed",            borrowed,
                "infirmary",           infirmary,
                "prisoner_labor",      labor,
                "properties_in_cells", props
        );

        var nonZero = counts.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .collect(Collectors.toList());

        if (!nonZero.isEmpty()) {
            String detail = nonZero.stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining(", "));
            logger.warn("Cannot delete prisoner {}: {}", prisonerId, detail);
            throw new IllegalStateException(
                    "Нельзя удалить заключённого с ID=" + prisonerId +
                            ": найдены связанные записи: " + detail
            );
        }

        dao.delete(prisonerId);
        logger.info("Deleted prisoner id={}", prisonerId);
    }
}