package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "security_level")
public class SecurityLevel {


    @Id
    @Column(name = "security_level_no")
    private Integer securityLevelNo;

    @NotBlank
    @Size(max = 10)
    @Column(name = "description", length = 10, nullable = false)
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