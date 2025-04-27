package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface JobRepository
        extends JpaRepository<Job, Integer> {
    Job findByJobDescription(String jobDescription);
}
