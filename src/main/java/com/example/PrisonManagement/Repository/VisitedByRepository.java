package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.VisitedBy;
import com.example.PrisonManagement.Model.VisitedByKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitedByRepository
       extends JpaRepository<VisitedBy, VisitedByKey> {
}