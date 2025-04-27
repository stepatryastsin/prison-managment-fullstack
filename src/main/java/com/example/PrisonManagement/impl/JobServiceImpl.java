package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Job;
import com.example.PrisonManagement.Repository.JobRepository;
import com.example.PrisonManagement.Repository.StaffRepository;
import com.example.PrisonManagement.Service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final StaffRepository staffRepository;

    private final Logger logger = LoggerFactory.getLogger(JobServiceImpl.class);
    @Autowired
    public JobServiceImpl(JobRepository jobRepository, StaffRepository staffRepository) {
        this.jobRepository = jobRepository;
        this.staffRepository = staffRepository;
    }

    @Override
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Override
    public Optional<Job> getJobById(Integer id) {
        return jobRepository.findById(id);
    }

    @Override
    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    @Override
    public Optional<Job> updateJob(Integer id, Job job) {
        return jobRepository.findById(id)
                .map(existingJob -> {
                    existingJob.setJobDescription(job.getJobDescription());
                    return jobRepository.save(existingJob);
                });
    }

    @Override
    public void deleteJob(Integer id) {
        long count = staffRepository.countByJob_JobId(id);
        if (count > 0) {
            String errorMessage = "Нельзя удалить работу, так как она используется сотрудниками";
            logger.warn("Попытка удаления работы с id {} не удалась: {}", id, errorMessage);
            throw new IllegalStateException(errorMessage);
        }
        if (!jobRepository.existsById(id)) {
            logger.warn("Работа с id {} не найдена для удаления", id);
            throw new IllegalStateException("Работа с id " + id + " не найдена");
        }
        jobRepository.deleteById(id);
    }

    @Override
    public int getUsageCount(Integer jobId) {
        return (int) staffRepository.countByJob_JobId(jobId);
    }
}