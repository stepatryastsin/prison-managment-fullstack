package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.PropertiesInCells;
import com.example.PrisonManagement.Entity.PropertiesInCellsKey;
import com.example.PrisonManagement.Repository.PropertiesInCellsRepository;
import com.example.PrisonManagement.Service.PropertiesInCellsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertiesInCellsServiceImpl implements PropertiesInCellsService {

    private final PropertiesInCellsRepository repository;

    @Override
    public List<PropertiesInCells> findAll() {
        log.info("Получение списка всех записей properties_in_cells");
        List<PropertiesInCells> propertiesList = repository.findAll();
        log.info("Найдено {} записей", propertiesList.size());
        return propertiesList;
    }

    @Override
    public PropertiesInCells findById(PropertiesInCellsKey id) {
        log.info("Поиск записи properties_in_cells по ключу: {}", id);
        return repository.findById(id)
                .orElseThrow(() -> {
                    log.error("Запись properties_in_cells не найдена по ключу: {}", id);
                    return new EntityNotFoundException("Запись не найдена для ключа: " + id);
                });
    }

    @Override
    public PropertiesInCells save(PropertiesInCells properties) {
        log.info("Сохранение записи properties_in_cells с ключом: {}", properties.getId());
        PropertiesInCells saved = repository.save(properties);
        log.info("Запись успешно сохранена с ключом: {}", saved.getId());
        return saved;
    }

    @Override
    public void delete(PropertiesInCellsKey id) {
        log.info("Удаление записи properties_in_cells по ключу: {}", id);
        if (repository.existsById(id)) {
            repository.deleteById(id);
            log.info("Запись с ключом {} успешно удалена", id);
        } else {
            log.error("Попытка удалить несуществующую запись с ключом: {}", id);
            throw new EntityNotFoundException("Запись не найдена для удаления с ключом: " + id);
        }
    }
}