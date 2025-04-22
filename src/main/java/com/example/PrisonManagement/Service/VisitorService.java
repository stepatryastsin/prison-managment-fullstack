package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Entity.Visitor;
import com.example.PrisonManagement.Repository.VisitorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

public interface VisitorService {
    List<Visitor> getAllVisitor();
    Optional<Visitor> getById(Long id);
    Visitor createVisitor(Visitor infirmary);
    Optional<Visitor> updateVisitor(Long id, Visitor infirmary);
    void deleteVisitor(Long id);
}
