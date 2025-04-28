package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.Job;

import java.util.List;
import java.util.Optional;

public interface JobService {

    List<Job> findAll();

    Job findById(Integer id);

    Job create(Job job);

    Job update(Integer id, Job job);

    void delete(Integer id);

    int getUsageCount(Integer jobId);

}