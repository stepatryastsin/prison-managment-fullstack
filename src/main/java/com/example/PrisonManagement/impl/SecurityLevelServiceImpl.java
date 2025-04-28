package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Model.SecurityLevel;
import com.example.PrisonManagement.Repository.SecurityLevelRepository;
import com.example.PrisonManagement.Service.SecurityLevelService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
@Service

public class SecurityLevelServiceImpl implements SecurityLevelService {

    private final SecurityLevelRepository repository;
    private final Logger logger
            = LoggerFactory.getLogger(SecurityLevelServiceImpl.class);
    public SecurityLevelServiceImpl(SecurityLevelRepository repository) {
        this.repository = repository;
    }


    @Override
    public List<SecurityLevel> findAll() {
        return repository.findAll();
    }

    @Override
    public SecurityLevel findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Уровень с id=" + id + " не найдена"));
    }

    @Override
    public SecurityLevel create(SecurityLevel securityLevel) {
        Integer id = securityLevel.getSecurityLevelNo();
        if (repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Уровень с id=" + id + " уже существует");
        }
        return repository.save(securityLevel);
    }

    @Override
    public SecurityLevel update(Integer id, SecurityLevel level) {
        SecurityLevel existing = findById(id);
        existing.setDescription(level.getDescription());
        return repository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Уровень с id=" + id + " не найдена");
        }
        repository.deleteById(id);
    }
}