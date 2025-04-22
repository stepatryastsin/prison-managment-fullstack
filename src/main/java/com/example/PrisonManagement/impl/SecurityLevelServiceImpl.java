package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.SecurityLevel;
import com.example.PrisonManagement.Repository.SecurityLevelRepository;
import com.example.PrisonManagement.Service.SecurityLevelService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityLevelServiceImpl implements SecurityLevelService {

    private final SecurityLevelRepository securityLevelRepository;

    @Override
    public List<SecurityLevel> getSecurityLevels() {
        log.info("Получение списка всех уровней безопасности");
        List<SecurityLevel> levels = securityLevelRepository.findAll();
        log.info("Найдено {} записей", levels.size());
        return levels;
    }

    @Override
    public Optional<SecurityLevel> getById(Integer id) {
        log.info("Поиск уровня безопасности по id: {}", id);
        Optional<SecurityLevel> levelOpt = securityLevelRepository.findById(id);
        if (levelOpt.isEmpty()) {
            log.warn("Уровень безопасности с id {} не найден", id);
        } else {
            log.info("Уровень безопасности с id {} найден: {}", id, levelOpt.get());
        }
        return levelOpt;
    }

    @Override
    public SecurityLevel createSecurityLevel(SecurityLevel securityLevel) {
        log.info("Создание нового уровня безопасности: {}", securityLevel);
        SecurityLevel created = securityLevelRepository.save(securityLevel);
        log.info("Уровень безопасности успешно создан с id: {}", created.getSecurityLevelNo());
        return created;
    }

    @Override
    public Optional<SecurityLevel> updateSecurityLevel(Integer id, SecurityLevel securityLevel) {
        log.info("Обновление уровня безопасности с id: {}", id);
        return securityLevelRepository.findById(id)
                .map(existingLevel -> {
                    existingLevel.setDescription(securityLevel.getDescription());
                    SecurityLevel updated = securityLevelRepository.save(existingLevel);
                    log.info("Уровень безопасности с id {} успешно обновлен: {}", id, updated);
                    return updated;
                }).or(() -> {
                    log.error("Не удалось обновить: уровень безопасности с id {} не найден", id);
                    return Optional.empty();
                });
    }

    @Override
    public void deleteSecurityLevel(Integer id) {
        log.info("Удаление уровня безопасности с id: {}", id);
        if (securityLevelRepository.existsById(id)) {
            securityLevelRepository.deleteById(id);
            log.info("Уровень безопасности с id {} успешно удален", id);
        } else {
            log.error("Ошибка удаления: уровень безопасности с id {} не найден", id);
            throw new EntityNotFoundException("Уровень безопасности с id " + id + " не найден");
        }
    }
}