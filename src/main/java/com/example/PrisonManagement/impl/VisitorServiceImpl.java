package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Visitor;
import com.example.PrisonManagement.Repository.VisitorDao;
import com.example.PrisonManagement.Service.VisitorService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class VisitorServiceImpl implements VisitorService {
    private final VisitorDao dao;

    public VisitorServiceImpl(VisitorDao dao) {
        this.dao = dao;
    }

    @Override
    public List<Visitor> findAll() {
        return dao.findAll();
    }

    @Override
    public Visitor findById(Integer id) {
        return dao.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Visitor with id=" + id + " not found"));
    }

    @Override
    public Visitor create(Visitor v) {
        if (dao.existsByPhone(v.getPhoneNumber())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phone number " + v.getPhoneNumber() + " is already registered");
        }
        return dao.create(v);
    }

    @Override
    public Visitor update(Integer id, Visitor v) {
        Visitor existing = findById(id);
        v.setVisitorId(existing.getVisitorId());
        return dao.update(v);
    }

    @Override
    public void delete(Integer id) {
        if (!dao.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Visitor with id=" + id + " not found");
        }
        dao.delete(id);
    }
}