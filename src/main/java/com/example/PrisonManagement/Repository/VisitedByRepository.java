package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.VisitedBy;
import com.example.PrisonManagement.Entity.VisitedByKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitedByRepository
       extends JpaRepository<VisitedBy, VisitedByKey> {
}