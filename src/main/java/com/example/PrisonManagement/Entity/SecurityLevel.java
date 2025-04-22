package com.example.PrisonManagement.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
@Entity
@Table(name = "security_level")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecurityLevel {

    @Id
    @Column(name = "security_level_no")
    private Integer securityLevelNo;

    @Column(name = "description", length = 6)
    private String description;
}