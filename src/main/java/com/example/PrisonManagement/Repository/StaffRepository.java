package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface StaffRepository
       extends JpaRepository<Staff, Integer> {
    long countByJob_JobId(Integer jobId);
}