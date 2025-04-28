package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Model.Visitor;

import java.util.List;
import java.util.Optional;

public interface VisitorService {

    List<Visitor> findAll();

    Visitor findById(Integer id);

    Visitor create(Visitor visitor);

    Visitor update(Integer id, Visitor visitor);

    void delete(Integer id);
}
