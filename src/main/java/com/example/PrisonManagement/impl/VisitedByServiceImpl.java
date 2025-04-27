package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.VisitedBy;
import com.example.PrisonManagement.Model.VisitedByKey;
import com.example.PrisonManagement.Repository.VisitedByRepository;
import com.example.PrisonManagement.Service.VisitedByService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VisitedByServiceImpl implements VisitedByService {

    @Autowired
    private VisitedByRepository visitedByRepository;
     @Override
    public List<VisitedBy> findAll() {
        return visitedByRepository.findAll();
    }
    @Override
    public Optional<VisitedBy> findById(VisitedByKey key) {
        return visitedByRepository.findById(key);
    }
    @Override
    public VisitedBy save(VisitedBy visitedBy) {
        return visitedByRepository.save(visitedBy);
    }
    @Override
    public void deleteById(VisitedByKey key) {
        visitedByRepository.deleteById(key);
    }
    @Override
    public boolean existsById(VisitedByKey key) {
        return visitedByRepository.existsById(key);
    }
}