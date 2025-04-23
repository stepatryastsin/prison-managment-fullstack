package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.PropertiesInCells;
import com.example.PrisonManagement.Entity.PropertiesInCellsKey;
import com.example.PrisonManagement.Repository.PropertiesInCellsRepository;
import com.example.PrisonManagement.Service.PropertiesInCellsService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class PropertiesInCellsServiceImpl implements PropertiesInCellsService {

    private final PropertiesInCellsRepository repository;
    private final Logger logger
            = LoggerFactory.getLogger(PropertiesInCellsServiceImpl.class);
    public PropertiesInCellsServiceImpl(PropertiesInCellsRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<PropertiesInCells> findAll() {
        logger.info("Получение списка всех записей properties_in_cells");
        List<PropertiesInCells> propertiesList = repository.findAll();
        logger.info("Найдено {} записей", propertiesList.size());
        return propertiesList;
    }

    @Override
    public PropertiesInCells findById(PropertiesInCellsKey id) {
        logger.info("Поиск записи properties_in_cells по ключу: {}", id);
        return repository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Запись properties_in_cells не найдена по ключу: {}", id);
                    return new EntityNotFoundException("Запись не найдена для ключа: " + id);
                });
    }

    @Override
    public PropertiesInCells save(PropertiesInCells properties) {
        logger.info("Сохранение записи properties_in_cells с ключом: {}", properties.getId());
        PropertiesInCells saved = repository.save(properties);
        logger.info("Запись успешно сохранена с ключом: {}", saved.getId());
        return saved;
    }

    @Override
    public void delete(PropertiesInCellsKey id) {
        logger.info("Удаление записи properties_in_cells по ключу: {}", id);
        if (repository.existsById(id)) {
            repository.deleteById(id);
            logger.info("Запись с ключом {} успешно удалена", id);
        } else {
            logger.error("Попытка удалить несуществующую запись с ключом: {}", id);
            throw new EntityNotFoundException("Запись не найдена для удаления с ключом: " + id);
        }
    }
}