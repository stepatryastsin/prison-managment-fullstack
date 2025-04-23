package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "infirmary")

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

    public Infirmary(Integer prescriptionNum, Prisoner prisoner, String relatedDoctor, String drugName, Integer drugUsageDay, String diseaseType) {
        this.prescriptionNum = prescriptionNum;
        this.prisoner = prisoner;
        this.relatedDoctor = relatedDoctor;
        this.drugName = drugName;
        this.drugUsageDay = drugUsageDay;
        this.diseaseType = diseaseType;
    }

    public Infirmary() {
    }

    public Integer getPrescriptionNum() {
        return prescriptionNum;
    }

    public void setPrescriptionNum(Integer prescriptionNum) {
        this.prescriptionNum = prescriptionNum;
    }

    public Prisoner getPrisoner() {
        return prisoner;
    }

    public void setPrisoner(Prisoner prisoner) {
        this.prisoner = prisoner;
    }

    public String getRelatedDoctor() {
        return relatedDoctor;
    }

    public void setRelatedDoctor(String relatedDoctor) {
        this.relatedDoctor = relatedDoctor;
    }

    public String getDrugName() {
        return drugName;
    }

    public void setDrugName(String drugName) {
        this.drugName = drugName;
    }

    public Integer getDrugUsageDay() {
        return drugUsageDay;
    }

    public void setDrugUsageDay(Integer drugUsageDay) {
        this.drugUsageDay = drugUsageDay;
    }

    public String getDiseaseType() {
        return diseaseType;
    }

    public void setDiseaseType(String diseaseType) {
        this.diseaseType = diseaseType;
    }
}