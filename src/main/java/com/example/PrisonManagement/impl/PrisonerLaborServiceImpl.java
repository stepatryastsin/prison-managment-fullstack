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
public class PrisonerLaborServiceImpl implements PrisonerLaborService {

    private final PrisonerLaborRepository prisonerLaborRepository;
    private final Logger logger
            = LoggerFactory.getLogger(PrisonerLaborServiceImpl.class);
    @Autowired
    public PrisonerLaborServiceImpl(PrisonerLaborRepository prisonerLaborRepository) {
        this.prisonerLaborRepository = prisonerLaborRepository;
    }

    @Override
    public List<PrisonerLabor> findAll() {
        logger.info("Получение всех записей о тюремном труде");
        return prisonerLaborRepository.findAll();
    }

    @Override
    public PrisonerLabor findById(Integer prisonerId, Integer staffId) {
        PrisonerLaborKey key = new PrisonerLaborKey(prisonerId, staffId);
        logger.info("Поиск записи тюремного труда с ключом ({}, {})", prisonerId, staffId);
        return prisonerLaborRepository.findById(key)
                .orElseThrow(() -> {
                    logger.error("Запись тюремного труда с ключом ({}, {}) не найдена", prisonerId, staffId);
                    return new EntityNotFoundException("Запись с ключом (" + prisonerId + ", " + staffId + ") не найдена");
                });
    }

    @Override
    @Transactional
    public PrisonerLabor save(PrisonerLabor prisonerLabor) {
        logger.info("Сохранение записи тюремного труда: {}", prisonerLabor);
        return prisonerLaborRepository.save(prisonerLabor);
    }

    @Override
    @Transactional
    public void deleteById(Integer prisonerId, Integer staffId) {
        PrisonerLaborKey key = new PrisonerLaborKey(prisonerId, staffId);
        logger.info("Удаление записи тюремного труда с ключом ({}, {})", prisonerId, staffId);
        PrisonerLabor entity = prisonerLaborRepository.findById(key)
                .orElseThrow(() -> {
                    logger.error("Запись тюремного труда с ключом ({}, {}) не найдена для удаления", prisonerId, staffId);
                    return new EntityNotFoundException("Запись с ключом (" + prisonerId + ", " + staffId + ") не найдена");
                });
        prisonerLaborRepository.delete(entity);
        logger.info("Запись тюремного труда с ключом ({}, {}) успешно удалена", prisonerId, staffId);
    }
}