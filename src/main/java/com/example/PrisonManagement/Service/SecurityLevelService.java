package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.Cell;
import com.example.PrisonManagement.Model.SecurityLevel;

import java.util.List;
import java.util.Optional;

public interface SecurityLevelService {
    List<SecurityLevel> findAll();
    SecurityLevel findById(Integer id);
    SecurityLevel create(SecurityLevel securityLevel);
    SecurityLevel update(Integer id, SecurityLevel securityLevel);
    void delete(Integer id);
}

