package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Job;
import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Repository.JobRepository;
import com.example.PrisonManagement.Repository.StaffRepository;
import com.example.PrisonManagement.Service.StaffService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class StaffServiceImpl implements StaffService {

    private static final Logger logger = LoggerFactory.getLogger(StaffServiceImpl.class);
    private final StaffRepository repo;

    @Autowired
    public StaffServiceImpl(StaffRepository repo) {
        this.repo = Objects.requireNonNull(repo, "StaffRepository must not be null");
        logger.info("Initialized StaffServiceImpl with repository: {}", repo.getClass().getSimpleName());
    }

    @Override
    @Transactional
    public List<Staff> findAll() {
        logger.debug("Start fetching all staff entries");
        List<Staff> list = repo.findAll();
        logger.info("Fetched {} staff entries", list.size());
        return list;
    }

    @Override
    @Transactional
    public Staff findById(Integer id) {
        Objects.requireNonNull(id, "Staff id must not be null");
        logger.debug("Finding staff with id={}", id);
        return repo.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Staff with id={} not found", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Staff with id=" + id + " not found");
                });
    }

    @Override
    public Staff create(Staff staff) {
        Objects.requireNonNull(staff, "Staff must not be null");
        logger.debug("Creating new staff: {} {}", staff.getFirstName(), staff.getLastName());
        Staff saved = repo.save(staff);
        logger.info("Created staff with id={}", saved.getStaffId());
        return saved;
    }

    @Override
    public Staff update(Integer id, Staff staff) {
        Objects.requireNonNull(id, "Staff id must not be null");
        Objects.requireNonNull(staff, "Staff must not be null");
        logger.debug("Updating staff with id={}", id);
        Staff existing = findById(id);
        existing.setFirstName(staff.getFirstName());
        existing.setLastName(staff.getLastName());
        existing.setSalary(staff.getSalary());
        existing.setJob(staff.getJob());
        Staff updated = repo.save(existing);
        logger.info("Updated staff with id={}", id);
        return updated;
    }

    @Override
    public void delete(Integer id) {
        Objects.requireNonNull(id, "Staff id must not be null");
        logger.debug("Deleting staff with id={}", id);
        if (!repo.existsById(id)) {
            logger.warn("Attempt to delete non-existent staff with id={}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Staff with id=" + id + " not found");
        }
        repo.deleteById(id);
        logger.info("Deleted staff with id={}", id);
    }

    @Override
    @Transactional
    public int getUsageCount(Integer jobId) {
        Objects.requireNonNull(jobId, "Job id must not be null");
        logger.debug("Counting staff usage for jobId={}", jobId);
        long count = repo.countByJob_JobId(jobId);
        logger.info("Job id={} is used by {} staff members", jobId, count);
        return (int) count;
    }
}
