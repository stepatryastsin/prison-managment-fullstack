package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.OwnCertificateFromKey;
import com.example.PrisonManagement.Model.VisitedBy;
import com.example.PrisonManagement.Model.VisitedByKey;
import com.example.PrisonManagement.Repository.VisitedByRepository;
import com.example.PrisonManagement.Service.VisitedByService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

// VisitedByServiceImpl.java
@Service
public class VisitedByServiceImpl implements VisitedByService {

    private final VisitedByRepository visitedByRepository;

    @Autowired
    public VisitedByServiceImpl(VisitedByRepository visitedByRepository) {
        this.visitedByRepository = visitedByRepository;
    }

    @Override
    public List<VisitedBy> findAll() {
        return visitedByRepository.findAll();
    }

    @Override
    public VisitedBy findById(VisitedByKey key) {
        return visitedByRepository.findById(key)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "VisitedBy with key " + key + " not found"
                ));
    }

    @Override
    public VisitedBy create(VisitedBy visitedBy) {
        VisitedByKey key = visitedBy.getId();
        if (visitedByRepository.existsById(key)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "VisitedBy with key " + key + " already exists"
            );
        }
        return visitedByRepository.save(visitedBy);
    }

    @Override
    public VisitedBy update(Integer prisonerId, Integer visitorId, VisitedBy visitedBy) {
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        if (!visitedByRepository.existsById(key)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "VisitedBy with key " + key + " not found"
            );
        }
        // сохраняем неизменённый ключ
        visitedBy.setId(key);
        return visitedByRepository.save(visitedBy);
    }

    @Override
    public void deleteById(VisitedByKey key) {
        if (!visitedByRepository.existsById(key)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "VisitedBy with key " + key + " not found"
            );
        }
        visitedByRepository.deleteById(key);
    }

    @Override
    public boolean existsById(VisitedByKey key) {
        return visitedByRepository.existsById(key);
    }
}
