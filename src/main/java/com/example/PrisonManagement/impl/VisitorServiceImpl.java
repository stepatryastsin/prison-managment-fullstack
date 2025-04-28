package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Visitor;
import com.example.PrisonManagement.Repository.VisitorRepository;
import com.example.PrisonManagement.Service.VisitorService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VisitorServiceImpl implements VisitorService {

    private final VisitorRepository repo;

    @Autowired
    public VisitorServiceImpl(VisitorRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Visitor> findAll() {
        return repo.findAll();
    }

    @Override
    public Visitor findById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Visitor with id=" + id + " not found"
                ));
    }

    @Override
    public Visitor create(Visitor visitor) {
        String phone = visitor.getPhoneNumber();
        if (repo.existsByPhoneNumber(phone)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phone number " + phone + " is already registered"
            );
        }
        return repo.save(visitor);
    }

    @Override
    public Visitor update(Integer id, Visitor visitor) {
        Visitor existing = findById(id);
        existing.setFirstName(visitor.getFirstName());
        existing.setLastName(visitor.getLastName());
        existing.setPhoneNumber(visitor.getPhoneNumber());
        existing.setRelationToPrisoner(visitor.getRelationToPrisoner());
        existing.setVisitDate(visitor.getVisitDate());
        return repo.save(existing);
    }

    @Override
    public void delete(Integer id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Visitor with id=" + id + " not found"
            );
        }
        repo.deleteById(id);
    }
}