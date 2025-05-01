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

    private static final Logger logger = LoggerFactory.getLogger(JobServiceImpl.class);
    private final JobRepository jobRepo;
    private final StaffRepository staffRepo;

    @Autowired
    public JobServiceImpl(JobRepository jobRepo, StaffRepository staffRepo) {
        this.jobRepo = jobRepo;
        this.staffRepo = staffRepo;
        logger.info("JobServiceImpl инициализирован");
    }

    @Override
    public List<Job> findAll() {
        logger.info("Запрошен список всех вакансий");
        List<Job> list = jobRepo.findAll();
        logger.info("Найдено {} вакансий", list.size());
        return list;
    }

    @Override
    public Job findById(Integer id) {
        logger.info("Запрошена вакансия с id={}", id);
        return jobRepo.findById(id)
                .map(job -> {
                    logger.info("Вакансия с id={} найдена: {}", id, job.getJobDescription());
                    return job;
                })
                .orElseThrow(() -> {
                    logger.warn("Вакансия с id={} не найдена", id);
                    return new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Job с id=" + id + " не найден");
                });
    }

    @Override
    public Job create(Job job) {
        logger.info("Попытка создать вакансию: {}", job.getJobDescription());
        Job created = jobRepo.save(job);
        logger.info("Вакансия создана с id={}", created.getJobId());
        return created;
    }

    @Override
    public Job update(Integer id, Job job) {
        logger.info("Попытка обновить вакансию id={}", id);
        Job existing = findById(id);
        existing.setJobDescription(job.getJobDescription());
        Job updated = jobRepo.save(existing);
        logger.info("Вакансия id={} успешно обновлена", id);
        return updated;
    }

    @Override
    public void delete(Integer id) {
        logger.info("Попытка удалить вакансию id={}", id);
        Job existing = findById(id);
        long usage = staffRepo.countByJob_JobId(id);
        logger.info("Количество сотрудников, использующих вакансию id={}: {}", id, usage);
        if (usage > 0) {
            logger.warn("Невозможно удалить вакансию id={}: используется сотрудниками", id);
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Job с id=" + id + " используется сотрудниками");
        }
        jobRepo.deleteById(id);
        logger.info("Вакансия id={} успешно удалена", id);
    }

    @Override
    public int getUsageCount(Integer jobId) {
        logger.info("Запрошено количество использований вакансии id={}", jobId);
        int count = (int) staffRepo.countByJob_JobId(jobId);
        logger.info("Вакансия id={} использована {} раз(а)", jobId, count);
        return count;
    }
}
