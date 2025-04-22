package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Entity.Job;
import com.example.PrisonManagement.Entity.Staff;
import com.example.PrisonManagement.Repository.JobRepository;
import com.example.PrisonManagement.Repository.StaffRepository;
import com.example.PrisonManagement.Service.StaffService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final JobRepository jobRepository;

    @Autowired
    public StaffServiceImpl(StaffRepository staffRepository, JobRepository jobRepository) {
        this.staffRepository = staffRepository;
        this.jobRepository = jobRepository;
    }

    @Override
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    @Override
    public Optional<Staff> getById(Integer id) {
        return staffRepository.findById(id);
    }

    @Override
    public Staff createStaff(Staff staff) {
        if (staff.getJob() != null) {
            // Получаем управляемую сущность Job или сохраняем новую, если такой нет
            staff.setJob(getManagedJob(staff.getJob()));
        }
        return staffRepository.save(staff);
    }

    @Override
    public Optional<Staff> updateStaff(Integer id, Staff staff) {
        return staffRepository.findById(id)
                .map(existingStaff -> {
                    existingStaff.setFirstName(staff.getFirstName());
                    existingStaff.setLastName(staff.getLastName());
                    existingStaff.setSalary(staff.getSalary());
                    existingStaff.setHiredate(staff.getHiredate());
                    if (staff.getJob() != null) {
                        // Устанавливаем управляемую сущность Job
                        existingStaff.setJob(getManagedJob(staff.getJob()));
                    }
                    return staffRepository.save(existingStaff);
                });
    }

    @Override
    public void deleteStaff(BigDecimal id) {
        staffRepository.deleteById(id.intValue());
    }

    private Job getManagedJob(Job job) {
        if (job.getJobId() != null) {
            return jobRepository.findById(job.getJobId())
                    .orElseThrow(() -> new RuntimeException("Job not found with id " + job.getJobId()));
        } else if (job.getJobDescription() != null && !job.getJobDescription().isEmpty()) {
            return jobRepository.findByJobDescription(job.getJobDescription())
                    .orElseGet(() -> jobRepository.save(job));
        } else {
            throw new IllegalArgumentException("Job must have either an id or a non-empty jobDescription");
        }
    }
}