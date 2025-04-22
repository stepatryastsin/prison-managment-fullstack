package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "infirmary")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Infirmary {

    @Id
    @Column(name = "prescription_num")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prescriptionNum;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prisoner_id")
    private Prisoner prisoner;

    @Column(name = "related_doctor", length = 40)
    private String relatedDoctor;

    @Column(name = "drug_name", length = 50)
    private String drugName;

    @Column(name = "drug_usage_day")
    private Integer drugUsageDay;

    @Column(name = "disease_type", length = 20)
    private String diseaseType;
}