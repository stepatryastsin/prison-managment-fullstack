package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.SecurityLevel;
import com.example.PrisonManagement.Repository.SecurityLevelRepository;
import com.example.PrisonManagement.Service.SecurityLevelService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service

public class SecurityLevelServiceImpl implements SecurityLevelService {

    private final SecurityLevelRepository securityLevelRepository;
    private final Logger logger
            = LoggerFactory.getLogger(SecurityLevelServiceImpl.class);
    public SecurityLevelServiceImpl(SecurityLevelRepository securityLevelRepository) {
        this.securityLevelRepository = securityLevelRepository;
    }

    @Override
    public List<SecurityLevel> getSecurityLevels() {
        logger.info("Получение списка всех уровней безопасности");
        List<SecurityLevel> levels = securityLevelRepository.findAll();
        logger.info("Найдено {} записей", levels.size());
        return levels;
    }

    @Override
    public Optional<SecurityLevel> getById(Integer id) {
        logger.info("Поиск уровня безопасности по id: {}", id);
        Optional<SecurityLevel> levelOpt = securityLevelRepository.findById(id);
        if (levelOpt.isEmpty()) {
            logger.warn("Уровень безопасности с id {} не найден", id);
        } else {
            logger.info("Уровень безопасности с id {} найден: {}", id, levelOpt.get());
        }
        return levelOpt;
    }

    @Override
    public SecurityLevel createSecurityLevel(SecurityLevel securityLevel) {
        logger.info("Создание нового уровня безопасности: {}", securityLevel);
        SecurityLevel created = securityLevelRepository.save(securityLevel);
        logger.info("Уровень безопасности успешно создан с id: {}", created.getSecurityLevelNo());
        return created;
    }

    @Override
    public Optional<SecurityLevel> updateSecurityLevel(Integer id, SecurityLevel securityLevel) {
        logger.info("Обновление уровня безопасности с id: {}", id);
        return securityLevelRepository.findById(id)
                .map(existingLevel -> {
                    existingLevel.setDescription(securityLevel.getDescription());
                    SecurityLevel updated = securityLevelRepository.save(existingLevel);
                    logger.info("Уровень безопасности с id {} успешно обновлен: {}", id, updated);
                    return updated;
                }).or(() -> {
                    logger.error("Не удалось обновить: уровень безопасности с id {} не найден", id);
                    return Optional.empty();
                });
    }

    @Override
    public void deleteSecurityLevel(Integer id) {
        logger.info("Удаление уровня безопасности с id: {}", id);
        if (securityLevelRepository.existsById(id)) {
            securityLevelRepository.deleteById(id);
            logger.info("Уровень безопасности с id {} успешно удален", id);
        } else {
            logger.error("Ошибка удаления: уровень безопасности с id {} не найден", id);
            throw new EntityNotFoundException("Уровень безопасности с id " + id + " не найден");
        }
    }
}