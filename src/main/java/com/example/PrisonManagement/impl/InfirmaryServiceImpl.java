package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Infirmary;
import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Repository.InfirmaryRepository;
import com.example.PrisonManagement.Repository.PrisonerRepository;
import com.example.PrisonManagement.Service.InfirmaryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Optional;


@Service
public class InfirmaryServiceImpl implements InfirmaryService {

    private final Logger logger = LoggerFactory.getLogger(InfirmaryServiceImpl.class);

    private final InfirmaryRepository infirmaryRepository;
    private final PrisonerRepository prisonerRepository;

    @Autowired
    public InfirmaryServiceImpl(InfirmaryRepository infirmaryRepository, PrisonerRepository prisonerRepository) {
        this.infirmaryRepository = infirmaryRepository;
        this.prisonerRepository = prisonerRepository;
    }

    @Override
    public List<Infirmary> getAllInfirmaries() {
        logger.info("Получение списка всех записей с лазарета");
        return infirmaryRepository.findAll();
    }

    @Override
    public Optional<Infirmary> getPrisonerFromInfirmaryById(Integer id) {
        logger.info("Получение камеры с id {}", id);
        return infirmaryRepository.findById(id)
                .map(cell -> {
                    logger.info("Найдено: {}", cell);
                    return cell;
                });
    }

    @Override
    @Transactional
    public Infirmary createInfirmary(Infirmary infirmaryDetails) {
        logger.info("Создание новой записи infirmary для заключенного с id {}", infirmaryDetails.getPrisoner().getPrisonerId());
        Prisoner prisoner = prisonerRepository.findById(infirmaryDetails.getPrisoner().getPrisonerId())
                .orElseThrow(() -> new EntityNotFoundException("Заключенный не найден с id: "
                        + infirmaryDetails.getPrisoner().getPrisonerId()));
        infirmaryDetails.setPrisoner(prisoner);
        Infirmary savedInfirmary = infirmaryRepository.save(infirmaryDetails);
        logger.info("Запись infirmary успешно создана с id {}", savedInfirmary.getPrescriptionNum());
        return savedInfirmary;
    }

    @Override
    @Transactional
    public Infirmary updateInfirmary(Integer id, Infirmary updatedInfirmary) {
        logger.info("Обновление записи infirmary с id {}", id);
        return infirmaryRepository.findById(id)
                .map(existing -> {
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
                    logger.info("Запись infirmary с id {} успешно обновлена", id);
                    return saved;
                })
                .orElseThrow(() -> {
                    logger.error("Запись infirmary не найдена с id {}", id);
                    return new EntityNotFoundException("Запись infirmary не найдена с id: " + id);
                });
    }

    @Override
    @Transactional
    public void deleteInfirmary(Integer id) {
        logger.info("Удаление записи infirmary с id {}", id);

        infirmaryRepository.deleteById(id);
        logger.info("Запись infirmary с id {} успешно удалена", id);
    }
}