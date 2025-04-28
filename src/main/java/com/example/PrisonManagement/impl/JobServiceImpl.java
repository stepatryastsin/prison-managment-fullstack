package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Job;
import com.example.PrisonManagement.Repository.JobRepository;
import com.example.PrisonManagement.Repository.StaffRepository;
import com.example.PrisonManagement.Service.JobService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
@Service
@Transactional
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepo;
    private final StaffRepository staffRepo;

    @Autowired
    public JobServiceImpl(JobRepository jobRepo, StaffRepository staffRepo) {
        this.jobRepo   = jobRepo;
        this.staffRepo = staffRepo;
    }

    @Override
    public List<Job> findAll() {
        return jobRepo.findAll();
    }

    @Override
    public Job findById(Integer id) {
        return jobRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Job с id=" + id + " не найден"));
    }

    @Override
    public Job create(Job job) {
        return jobRepo.save(job);
    }

    @Override
    public Job update(Integer id, Job job) {
        Job existing = findById(id);
        existing.setJobDescription(job.getJobDescription());
        return jobRepo.save(existing);
    }

    @Override
    public void delete(Integer id) {
        Job existing = findById(id);
        long usage = staffRepo.countByJob_JobId(id);
        if (usage > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Job с id=" + id + " используется сотрудниками");
        }
        jobRepo.deleteById(id);
    }

    @Override
    public int getUsageCount(Integer jobId) {
        return (int) staffRepo.countByJob_JobId(jobId);
    }
}