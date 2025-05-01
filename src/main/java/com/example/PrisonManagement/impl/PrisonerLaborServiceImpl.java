package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.PrisonerLabor;
import com.example.PrisonManagement.Model.PrisonerLaborKey;
import com.example.PrisonManagement.Repository.PrisonerLaborRepository;
import com.example.PrisonManagement.Service.PrisonerLaborService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Transactional
public class PrisonerLaborServiceImpl implements PrisonerLaborService {

    private static final Logger logger = LoggerFactory.getLogger(PrisonerLaborServiceImpl.class);
    private final PrisonerLaborRepository prisonerLaborRepository;

    @Autowired
    public PrisonerLaborServiceImpl(PrisonerLaborRepository prisonerLaborRepository) {
        this.prisonerLaborRepository = prisonerLaborRepository;
        logger.info("PrisonerLaborServiceImpl инициализирован");
    }

    @Override
    public List<PrisonerLabor> findAll() {
        logger.info("Запрошены все записи тюремного труда");
        List<PrisonerLabor> list = prisonerLaborRepository.findAll();
        logger.info("Найдено {} записей тюремного труда", list.size());
        return list;
    }

    @Override
    public PrisonerLabor findById(Integer prisonerId, Integer staffId) {
        PrisonerLaborKey key = new PrisonerLaborKey(prisonerId, staffId);
        logger.info("Поиск записи тюремного труда с ключом ({}, {})", prisonerId, staffId);
        return prisonerLaborRepository.findById(key)
                .map(entity -> {
                    logger.info("Запись с ключом ({}, {}) найдена", prisonerId, staffId);
                    return entity;
                })
                .orElseThrow(() -> {
                    logger.error("Запись с ключом ({}, {}) не найдена", prisonerId, staffId);
                    return new EntityNotFoundException(
                            "Запись с ключом (" + prisonerId + ", " + staffId + ") не найдена");
                });
    }

    @Override
    public PrisonerLabor save(PrisonerLabor prisonerLabor) {
        PrisonerLaborKey key = prisonerLabor.getId();
        logger.info("Сохранение записи тюремного труда с ключом ({}, {})", key.getPrisonerId(), key.getStaffId());
        PrisonerLabor saved = prisonerLaborRepository.save(prisonerLabor);
        logger.info("Запись с ключом ({}, {}) успешно сохранена", key.getPrisonerId(), key.getStaffId());
        return saved;
    }

    @Override
    public void deleteById(Integer prisonerId, Integer staffId) {
        PrisonerLaborKey key = new PrisonerLaborKey(prisonerId, staffId);
        logger.info("Удаление записи тюремного труда с ключом ({}, {})", prisonerId, staffId);
        PrisonerLabor entity = prisonerLaborRepository.findById(key)
                .orElseThrow(() -> {
                    logger.error("Запись с ключом ({}, {}) не найдена для удаления", prisonerId, staffId);
                    return new EntityNotFoundException(
                            "Запись с ключом (" + prisonerId + ", " + staffId + ") не найдена");
                });
        prisonerLaborRepository.delete(entity);
        logger.info("Запись с ключом ({}, {}) успешно удалена", prisonerId, staffId);
    }
}
