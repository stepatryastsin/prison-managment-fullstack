package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Entity.SecurityLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityLevelRepository
       extends JpaRepository<SecurityLevel, Integer> {
}
