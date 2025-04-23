package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.Staff;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StaffService {
    List<Staff> getAllStaff();
    Optional<Staff> getById(Integer id);
    Staff createStaff(Staff staff);
    Optional<Staff> updateStaff(Integer id, Staff staff);
    void deleteStaff(BigDecimal id);
}