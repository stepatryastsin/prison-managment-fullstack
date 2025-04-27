package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Model.SecurityLevel;

import java.util.List;
import java.util.Optional;

public interface SecurityLevelService {
    List<SecurityLevel> getSecurityLevels();
    Optional<SecurityLevel> getById(Integer id);
    SecurityLevel createSecurityLevel(SecurityLevel securityLevel);
    Optional<SecurityLevel> updateSecurityLevel(Integer id, SecurityLevel securityLevel);
    void deleteSecurityLevel(Integer id);
}