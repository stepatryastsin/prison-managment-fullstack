package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.Cell;
import com.example.PrisonManagement.Entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Integer> {
    Optional<Job> findByJobDescription(String jobDescription);
}
