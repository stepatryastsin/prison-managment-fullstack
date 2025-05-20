package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {
    long countByJob_JobId(Integer jobId);
    Optional<Staff> findByUsername(String username);
}