package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.Staff;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StaffService {

    List<Staff> findAll();
    Staff findById(Integer id);
    Staff create(Staff staff);
    Staff update(Integer id, Staff staff);
    void delete(Integer id);
    int getUsageCount(Integer jobId);
    Staff setPassword(String username, String rawPassword);

}