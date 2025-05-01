package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Infirmary;
import com.example.PrisonManagement.Repository.InfirmaryRepository;
import com.example.PrisonManagement.Service.InfirmaryService;
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
public class InfirmaryServiceImpl implements InfirmaryService {

    private static final Logger logger = LoggerFactory.getLogger(InfirmaryServiceImpl.class);
    private final InfirmaryRepository repo;

    @Autowired
    public InfirmaryServiceImpl(InfirmaryRepository repo) {
        this.repo = repo;
        logger.info("InfirmaryServiceImpl инициализирован");
    }

    @Override
    public List<Infirmary> findAll() {
        logger.info("Запрошен список всех записей медицинской службы");
        List<Infirmary> list = repo.findAll();
        logger.info("Найдено {} записей медицинских назначений", list.size());
        return list;
    }

    @Override
    public Infirmary findById(Integer prescriptionNum) {
        logger.info("Запрошена запись по prescriptionNum={}", prescriptionNum);
        return repo.findById(prescriptionNum)
                .map(i -> {
                    logger.info("Запись prescriptionNum={} найдена", prescriptionNum);
                    return i;
                })
                .orElseThrow(() -> {
                    logger.warn("Запись prescriptionNum={} не найдена", prescriptionNum);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Запись prescriptionNum=" + prescriptionNum + " не найдена");
                });
    }

    @Override
    public Infirmary findByPrisonerId(Integer prisonerId) {
        logger.info("Запрошена запись по prisonerId={}", prisonerId);
        return repo.findByPrisoner_PrisonerId(prisonerId)
                .map(i -> {
                    logger.info("Запись для prisonerId={} найдена", prisonerId);
                    return i;
                })
                .orElseThrow(() -> {
                    logger.warn("Запись для prisonerId={} не найдена", prisonerId);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Запись для prisonerId=" + prisonerId + " не найдена");
                });
    }

    @Override
    public Infirmary createOrUpdate(Infirmary infirmary) {
        Integer pid = infirmary.getPrisoner().getPrisonerId();
        logger.info("Попытка создать или обновить запись для prisonerId={}", pid);
        Infirmary result = repo.findByPrisoner_PrisonerId(pid)
                .map(existing -> {
                    logger.info("Обновление существующей записи для prisonerId={}", pid);
                    existing.setRelatedDoctor(infirmary.getRelatedDoctor());
                    existing.setDrugName(infirmary.getDrugName());
                    existing.setDrugUsageDay(infirmary.getDrugUsageDay());
                    existing.setDiseaseType(infirmary.getDiseaseType());
                    Infirmary updated = repo.save(existing);
                    logger.info("Запись для prisonerId={} успешно обновлена", pid);
                    return updated;
                })
                .orElseGet(() -> {
                    logger.info("Создание новой записи для prisonerId={}", pid);
                    Infirmary created = repo.save(infirmary);
                    logger.info("Новая запись для prisonerId={} успешно создана", pid);
                    return created;
                });
        return result;
    }

    @Override
    public Infirmary update(Integer prescriptionNum, Infirmary infirmary) {
        logger.info("Попытка обновить запись prescriptionNum={}", prescriptionNum);
        Infirmary existing = findById(prescriptionNum);
        existing.setRelatedDoctor(infirmary.getRelatedDoctor());
        existing.setDrugName(infirmary.getDrugName());
        existing.setDrugUsageDay(infirmary.getDrugUsageDay());
        existing.setDiseaseType(infirmary.getDiseaseType());
        Infirmary updated = repo.save(existing);
        logger.info("Запись prescriptionNum={} успешно обновлена", prescriptionNum);
        return updated;
    }

    @Override
    public void deleteByPrescriptionNum(Integer prescriptionNum) {
        logger.info("Попытка удалить запись prescriptionNum={}", prescriptionNum);
        if (!repo.existsById(prescriptionNum)) {
            logger.warn("Невозможно удалить: запись prescriptionNum={} не найдена", prescriptionNum);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Запись prescriptionNum=" + prescriptionNum + " не найдена");
        }
        repo.deleteById(prescriptionNum);
        logger.info("Запись prescriptionNum={} успешно удалена", prescriptionNum);
    }

    @Override
    public void deleteByPrisonerId(Integer prisonerId) {
        logger.info("Попытка удалить запись для prisonerId={}", prisonerId);
        if (!repo.existsByPrisoner_PrisonerId(prisonerId)) {
            logger.warn("Невозможно удалить: запись для prisonerId={} не найдена", prisonerId);
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Запись для prisonerId=" + prisonerId + " не найдена");
        }
        repo.deleteByPrisoner_PrisonerId(prisonerId);
        logger.info("Запись для prisonerId={} успешно удалена", prisonerId);
    }
}
