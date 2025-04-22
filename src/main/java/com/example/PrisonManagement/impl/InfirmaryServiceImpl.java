package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Infirmary;
import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Repository.InfirmaryRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Service.InfirmaryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InfirmaryServiceImpl implements InfirmaryService {

    private final InfirmaryRepository infirmaryRepository;
    private final PrisonerRepository prisonerRepository;

    @Override
    public List<Infirmary> getAllInfirmaries() {
        log.info("Получение списка всех записей инкубатории (infirmary)");
        return infirmaryRepository.findAll();
    }

    @Override
    public Infirmary getById(Long id) {
        log.info("Получение записи infirmary по id {}", id);
        return infirmaryRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Запись infirmary не найдена по id {}", id);
                    return new EntityNotFoundException("Запись infirmary не найдена с id: " + id);
                });
    }

    @Override
    @Transactional
    public Infirmary createInfirmary(Infirmary infirmaryDetails) {
        log.info("Создание новой записи infirmary для заключенного с id {}", infirmaryDetails.getPrisoner().getPrisonerId());
        // Проверяем, существует ли заключенный
        Prisoner prisoner = prisonerRepository.findById(infirmaryDetails.getPrisoner().getPrisonerId())
                .orElseThrow(() -> new EntityNotFoundException("Заключенный не найден с id: "
                        + infirmaryDetails.getPrisoner().getPrisonerId()));
        infirmaryDetails.setPrisoner(prisoner);
        Infirmary savedInfirmary = infirmaryRepository.save(infirmaryDetails);
        log.info("Запись infirmary успешно создана с id {}", savedInfirmary.getPrescriptionNum());
        return savedInfirmary;
    }

    @Override
    @Transactional
    public Infirmary updateInfirmary(Long id, Infirmary updatedInfirmary) {
        log.info("Обновление записи infirmary с id {}", id);
        return infirmaryRepository.findById(id)
                .map(existing -> {
                    // Если требуется, можно также проверить существование заключенного
                    if (updatedInfirmary.getPrisoner() != null) {
                        Prisoner prisoner = prisonerRepository.findById(updatedInfirmary.getPrisoner().getPrisonerId())
                                .orElseThrow(() -> new EntityNotFoundException("Заключенный не найден с id: "
                                        + updatedInfirmary.getPrisoner().getPrisonerId()));
                        existing.setPrisoner(prisoner);
                    }
                    existing.setRelatedDoctor(updatedInfirmary.getRelatedDoctor());
                    existing.setDrugName(updatedInfirmary.getDrugName());
                    existing.setDrugUsageDay(updatedInfirmary.getDrugUsageDay());
                    existing.setDiseaseType(updatedInfirmary.getDiseaseType());
                    Infirmary saved = infirmaryRepository.save(existing);
                    log.info("Запись infirmary с id {} успешно обновлена", id);
                    return saved;
                })
                .orElseThrow(() -> {
                    log.error("Запись infirmary не найдена с id {}", id);
                    return new EntityNotFoundException("Запись infirmary не найдена с id: " + id);
                });
    }

    @Override
    @Transactional
    public void deleteInfirmary(Long id) {
        log.info("Удаление записи infirmary с id {}", id);
        // При необходимости можно добавить проверку наличия зависимых сущностей
        if (!infirmaryRepository.existsById(id)) {
            log.error("Запись infirmary не найдена с id {}", id);
            throw new EntityNotFoundException("Запись infirmary не найдена с id: " + id);
        }
        infirmaryRepository.deleteById(id);
        log.info("Запись infirmary с id {} успешно удалена", id);
    }
}