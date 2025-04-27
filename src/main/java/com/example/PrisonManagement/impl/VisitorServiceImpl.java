package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Visitor;
import com.example.PrisonManagement.Repository.VisitorRepository;
import com.example.PrisonManagement.Service.VisitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VisitorServiceImpl implements VisitorService {

    private final VisitorRepository visitorRepository;

    @Autowired
    public VisitorServiceImpl(VisitorRepository visitorRepository) {
        this.visitorRepository = visitorRepository;
    }

    @Override
    public List<Visitor> getAllVisitor() {
        return visitorRepository.findAll();
    }

    @Override
    public Optional<Visitor> getById(Long id) {
        return visitorRepository.findById(id);
    }

    @Override
    public Visitor createVisitor(Visitor visitor) {
        return visitorRepository.save(visitor);
    }

    @Override
    public Optional<Visitor> updateVisitor(Long id, Visitor updatedVisitor) {
        return visitorRepository.findById(id)
                .map(visitor -> {
                    visitor.setFirstName(updatedVisitor.getFirstName());
                    visitor.setLastName(updatedVisitor.getLastName());
                    visitor.setPhoneNumber(updatedVisitor.getPhoneNumber());
                    visitor.setRelationToPrisoner(updatedVisitor.getRelationToPrisoner());
                    visitor.setVisitDate(updatedVisitor.getVisitDate());
                    return visitorRepository.save(visitor);
                });
    }

    @Override
    public void deleteVisitor(Long id) {
        visitorRepository.deleteById(id);
    }
}