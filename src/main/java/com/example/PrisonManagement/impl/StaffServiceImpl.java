package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Job;
import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Repository.JobRepository;
import com.example.PrisonManagement.Repository.StaffRepository;
import com.example.PrisonManagement.Service.StaffService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StaffServiceImpl implements StaffService {

    private final StaffRepository repo;

    @Autowired
    public StaffServiceImpl(StaffRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Staff> findAll() {
        return repo.findAll();
    }

    @Override
    public Staff findById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Staff with id=" + id + " not found"));
    }

    @Override
    public Staff create(Staff staff) {
        // cascade PERSIST/MERGE on Job will handle new or existing Job
        return repo.save(staff);
    }

    @Override
    public Staff update(Integer id, Staff staff) {
        Staff existing = findById(id);
        existing.setFirstName(staff.getFirstName());
        existing.setLastName(staff.getLastName());
        existing.setSalary(staff.getSalary());
        existing.setJob(staff.getJob());
        return repo.save(existing);
    }

    @Override
    public void delete(Integer id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Staff with id=" + id + " not found");
        }
        repo.deleteById(id);
    }

    @Override
    public int getUsageCount(Integer jobId) {
        return (int) repo.countByJob_JobId(jobId);
    }
}