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
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder encoder;

    public StaffServiceImpl(StaffRepository repo, PasswordEncoder encoder) {
        this.repo = Objects.requireNonNull(repo);
        this.encoder = Objects.requireNonNull(encoder);
        logger.info("Initialized StaffServiceImpl");
    }

    @Override
    public List<Staff> findAll() {
        logger.debug("Fetching all staff");
        List<Staff> list = repo.findAll();
        logger.info("Fetched {} entries", list.size());
        return list;
    }

    @Override
    public Staff findById(Integer id) {
        Objects.requireNonNull(id);
        return repo.findById(id).orElseThrow(() -> {
            logger.warn("Not found id={}", id);
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found");
        });
    }

    @Override
    public Staff create(Staff staff) {
        Objects.requireNonNull(staff);
        logger.debug("Creating {}", staff);
        Staff saved = repo.save(staff);
        logger.info("Created id={}", saved.getStaffId());
        return saved;
    }

    @Override
    public Staff update(Integer id, Staff staff) {
        Objects.requireNonNull(id);
        Objects.requireNonNull(staff);
        Staff exist = findById(id);

        exist.setFirstName(staff.getFirstName());
        exist.setLastName(staff.getLastName());
        exist.setJob(staff.getJob());
        exist.setSalary(staff.getSalary());

        if (staff.getPhoto() != null && staff.getPhoto().length > 0) {
            exist.setPhoto(staff.getPhoto());
        }

        Staff upd = repo.save(exist);
        logger.info("Updated id={}", id);
        return upd;
    }

    @Override
    public void delete(Integer id) {
        Objects.requireNonNull(id);
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff not found");
        }
        repo.deleteById(id);
        logger.info("Deleted id={}", id);
    }

    @Override
    public int getUsageCount(Integer jobId) {
        Objects.requireNonNull(jobId);
        long count = repo.countByJob_JobId(jobId);
        logger.info("Job {} used by {}", jobId, count);
        return (int) count;
    }

    @Override
    public Staff setPassword(String username, String rawPassword) {
        Staff s = repo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found"));
        s.setPassword(encoder.encode(rawPassword));
        return repo.save(s);
    }
}