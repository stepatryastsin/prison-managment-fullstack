package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "security_level")

public class SecurityLevel {

    @Id
    @Column(name = "security_level_no")
    private Integer securityLevelNo;

    @Column(name = "description", length = 6)
    private String description;

    public SecurityLevel(Integer securityLevelNo, String description) {
        this.securityLevelNo = securityLevelNo;
        this.description = description;
    }

    public SecurityLevel() {
    }

    public Integer getSecurityLevelNo() {
        return securityLevelNo;
    }

    public void setSecurityLevelNo(Integer securityLevelNo) {
        this.securityLevelNo = securityLevelNo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}