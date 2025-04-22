package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.PropertiesInCells;
import com.example.PrisonManagement.Entity.PropertiesInCellsKey;
import com.example.PrisonManagement.Service.PropertiesInCellsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class PropertiesInCellsController {

    private final PropertiesInCellsService service;

    // Получить все записи
    @GetMapping
    public List<PropertiesInCells> getAllProperties() {
        log.info("Запрос на получение всех записей properties_in_cells");
        List<PropertiesInCells> list = service.findAll();
        log.info("Возвращено {} записей", list.size());
        return list;
    }

    // Получить запись по составному ключу
    @GetMapping("/{prisonerId}/{propertyName}")
    public PropertiesInCells getProperties(@PathVariable Integer prisonerId,
                                           @PathVariable String propertyName) {
        PropertiesInCellsKey key = new PropertiesInCellsKey(propertyName, prisonerId);
        log.info("Получение записи по составному ключу: {}", key);
        return service.findById(key);
    }

    // Создать новую запись
    @PostMapping
    public PropertiesInCells createProperties(@RequestBody PropertiesInCells properties) {
        log.info("Создание новой записи properties_in_cells для ключа: {}", properties.getId());
        PropertiesInCells created = service.save(properties);
        log.info("Запись создана успешно: {}", created.getId());
        return created;
    }

    // Обновить запись по составному ключу
    @PutMapping("/{prisonerId}/{propertyName}")
    public PropertiesInCells updateProperties(@PathVariable Integer prisonerId,
                                              @PathVariable String propertyName,
                                              @RequestBody PropertiesInCells properties) {
        PropertiesInCellsKey key = new PropertiesInCellsKey(propertyName, prisonerId);
        log.info("Обновление записи properties_in_cells для ключа: {}", key);
        // Устанавливаем составной ключ для обновляемого объекта
        properties.setId(key);
        PropertiesInCells updated = service.save(properties);
        log.info("Запись обновлена успешно: {}", updated.getId());
        return updated;
    }

    // Удалить запись по составному ключу
    @DeleteMapping("/{prisonerId}/{propertyName}")
    public void deleteProperties(@PathVariable Integer prisonerId,
                                 @PathVariable String propertyName) {
        PropertiesInCellsKey key = new PropertiesInCellsKey(propertyName, prisonerId);
        log.info("Запрос на удаление записи properties_in_cells для ключа: {}", key);
        try {
            service.delete(key);
            log.info("Запись с ключом {} удалена", key);
        } catch (EntityNotFoundException e) {
            log.error("Ошибка удаления: {}", e.getMessage());
            throw e;
        }
    }
}