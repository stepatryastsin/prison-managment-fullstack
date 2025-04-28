package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.VisitedBy;
import com.example.PrisonManagement.Model.VisitedByKey;


import java.util.List;
import java.util.Optional;

public interface VisitedByService {
    List<VisitedBy> findAll();
    VisitedBy findById(VisitedByKey key);
    VisitedBy create(VisitedBy visitedBy);
    VisitedBy update(Integer prisonerId, Integer visitorId, VisitedBy visitedBy);
    void deleteById(VisitedByKey key);
    boolean existsById(VisitedByKey key);
}
