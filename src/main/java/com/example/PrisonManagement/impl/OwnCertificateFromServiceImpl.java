package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.OwnCertificateFrom;
import com.example.PrisonManagement.Entity.OwnCertificateFromKey;
import com.example.PrisonManagement.Repository.OwnCertificateFromRepository;
import com.example.PrisonManagement.Service.OwnCertificateFromService;
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
public class OwnCertificateFromServiceImpl implements OwnCertificateFromService {

    private final OwnCertificateFromRepository repository;

    @Override
    public List<OwnCertificateFrom> getAll() {
        log.info("Получение всех сертификатов");
        return repository.findAll();
    }

    @Override
    public OwnCertificateFrom getById(Integer prisonerId, Integer courseId) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        log.info("Поиск сертификата с ключом ({}, {})", prisonerId, courseId);
        return repository.findById(key)
                .orElseThrow(() -> {
                    log.error("Сертификат с ключом ({}, {}) не найден", prisonerId, courseId);
                    return new EntityNotFoundException("Сертификат с ключом (" + prisonerId + ", " + courseId + ") не найден");
                });
    }

    @Override
    public OwnCertificateFrom create(OwnCertificateFrom ownCertificateFrom) {
        log.info("Создание нового сертификата: {}", ownCertificateFrom);
        return repository.save(ownCertificateFrom);
    }

    @Override
    @Transactional
    public OwnCertificateFrom update(Integer prisonerId, Integer courseId, OwnCertificateFrom ownCertificateFrom) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        log.info("Обновление сертификата с ключом ({}, {})", prisonerId, courseId);
        return repository.findById(key)
                .map(existing -> {
                    // Обновляем данные. Если требуется обновлять только определённые поля, можно явно указать их.
                    ownCertificateFrom.setId(key);  // Гарантируем, что ключ остается прежним
                    OwnCertificateFrom updated = repository.save(ownCertificateFrom);
                    log.info("Сертификат с ключом ({}, {}) успешно обновлён", prisonerId, courseId);
                    return updated;
                })
                .orElseThrow(() -> {
                    log.error("Сертификат с ключом ({}, {}) не найден для обновления", prisonerId, courseId);
                    return new EntityNotFoundException("Сертификат с ключом (" + prisonerId + ", " + courseId + ") не найден");
                });
    }

    @Override
    @Transactional
    public OwnCertificateFrom delete(Integer prisonerId, Integer courseId) {
        OwnCertificateFromKey key = new OwnCertificateFromKey(prisonerId, courseId);
        log.info("Удаление сертификата с ключом ({}, {})", prisonerId, courseId);
        OwnCertificateFrom entity = repository.findById(key)
                .orElseThrow(() -> {
                    log.error("Сертификат с ключом ({}, {}) не найден для удаления", prisonerId, courseId);
                    return new EntityNotFoundException("Сертификат с ключом (" + prisonerId + ", " + courseId + ") не найден");
                });
        repository.delete(entity);
        log.info("Сертификат с ключом ({}, {}) успешно удалён", prisonerId, courseId);
        return entity;
    }
}