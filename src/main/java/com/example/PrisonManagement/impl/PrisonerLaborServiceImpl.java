package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.PrisonerLabor;
import com.example.PrisonManagement.Entity.PrisonerLaborKey;
import com.example.PrisonManagement.Repository.PrisonerLaborRepository;
import com.example.PrisonManagement.Service.PrisonerLaborService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrisonerLaborServiceImpl implements PrisonerLaborService {

    private final PrisonerLaborRepository prisonerLaborRepository;

    @Override
    public List<PrisonerLabor> findAll() {
        log.info("Получение всех записей о тюремном труде");
        return prisonerLaborRepository.findAll();
    }

    @Override
    public PrisonerLabor findById(Integer prisonerId, Integer staffId) {
        PrisonerLaborKey key = new PrisonerLaborKey(prisonerId, staffId);
        log.info("Поиск записи тюремного труда с ключом ({}, {})", prisonerId, staffId);
        return prisonerLaborRepository.findById(key)
                .orElseThrow(() -> {
                    log.error("Запись тюремного труда с ключом ({}, {}) не найдена", prisonerId, staffId);
                    return new EntityNotFoundException("Запись с ключом (" + prisonerId + ", " + staffId + ") не найдена");
                });
    }

    @Override
    @Transactional
    public PrisonerLabor save(PrisonerLabor prisonerLabor) {
        log.info("Сохранение записи тюремного труда: {}", prisonerLabor);
        return prisonerLaborRepository.save(prisonerLabor);
    }

    @Override
    @Transactional
    public void deleteById(Integer prisonerId, Integer staffId) {
        PrisonerLaborKey key = new PrisonerLaborKey(prisonerId, staffId);
        log.info("Удаление записи тюремного труда с ключом ({}, {})", prisonerId, staffId);
        PrisonerLabor entity = prisonerLaborRepository.findById(key)
                .orElseThrow(() -> {
                    log.error("Запись тюремного труда с ключом ({}, {}) не найдена для удаления", prisonerId, staffId);
                    return new EntityNotFoundException("Запись с ключом (" + prisonerId + ", " + staffId + ") не найдена");
                });
        prisonerLaborRepository.delete(entity);
        log.info("Запись тюремного труда с ключом ({}, {}) успешно удалена", prisonerId, staffId);
    }
}