package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Entity.Visitor;

import java.util.List;
import java.util.Optional;

public interface VisitorService {
    List<Visitor> getAllVisitor();
    Optional<Visitor> getById(Long id);
    Visitor createVisitor(Visitor infirmary);
    Optional<Visitor> updateVisitor(Long id, Visitor infirmary);
    void deleteVisitor(Long id);
}
