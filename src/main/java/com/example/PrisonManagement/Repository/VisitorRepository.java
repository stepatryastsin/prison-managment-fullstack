package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
}