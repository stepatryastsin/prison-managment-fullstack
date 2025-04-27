package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.Job;

import java.util.List;
import java.util.Optional;

public interface JobService {
    List<Job> getAllJobs();
    Optional<Job> getJobById(Integer id);
    Job createJob(Job job);
    Optional<Job> updateJob(Integer id, Job job);
    void deleteJob(Integer id);
    int getUsageCount(Integer jobId);
}