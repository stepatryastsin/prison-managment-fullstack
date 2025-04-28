package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.PropertiesInCells;
import com.example.PrisonManagement.Model.PropertiesInCellsKey;
import com.example.PrisonManagement.Repository.PropertiesInCellsRepository;
import com.example.PrisonManagement.Service.PropertiesInCellsService;
import jakarta.persistence.EntityNotFoundException;
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
public class PropertiesInCellsServiceImpl implements PropertiesInCellsService {

    private final PropertiesInCellsRepository repository;

    @Autowired
    public PropertiesInCellsServiceImpl(PropertiesInCellsRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<PropertiesInCells> findAll() {
        return repository.findAll();
    }

    @Override
    public PropertiesInCells findById(PropertiesInCellsKey id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Property not found for key: " + id
                ));
    }

    @Override
    public PropertiesInCells create(PropertiesInCells properties) {
        PropertiesInCellsKey key = properties.getId();
        if (repository.existsById(key)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Property already exists for key: " + key
            );
        }
        return repository.save(properties);
    }

    @Override
    public PropertiesInCells update(PropertiesInCellsKey id, PropertiesInCells properties) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Cannot update non-existent property with key: " + id
            );
        }
        // ensure the key on the incoming object matches the path variables
        properties.setId(id);
        return repository.save(properties);
    }

    @Override
    public void delete(PropertiesInCellsKey id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Cannot delete non-existent property with key: " + id
            );
        }
        repository.deleteById(id);
    }
}