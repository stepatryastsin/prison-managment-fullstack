package com.example.PrisonManagement.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "infirmary")

public class Infirmary {

    @Id
    @Column(name = "prescription_num")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prescriptionNum;

    @NotNull(message = "Необходим заключенный")
    @ManyToOne
    @JoinColumn(name = "prisoner_id", nullable = false)
    private Prisoner prisoner;

    @Column(name = "related_doctor", length = 40, nullable = false)
    @NotBlank(message = "Необходим лечащий врач")
    @Size(max = 40, message = "Имя доктора не должно превышать 40 символов")
    private String relatedDoctor;

    @Column(name = "drug_name", length = 50)
    @Size(max = 50, message = "Название препарата не должно превышать 50 символов")
    private String drugName;

    @Column(name = "drug_usage_day")
    @PositiveOrZero(message = "Usage days must be zero or positive")
    private Integer drugUsageDay;

    @Column(name = "disease_type", length = 20)
    @Size(max = 20, message = "Disease type must be up to 20 characters")
    private String diseaseType;

    public Infirmary(Integer prescriptionNum,
                     Prisoner prisoner,
                     String relatedDoctor,
                     String drugName,
                     Integer drugUsageDay,
                     String diseaseType) {
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

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Infirmary infirmary)) return false;

        return getPrescriptionNum().equals(infirmary.getPrescriptionNum()) &&
               getPrisoner().equals(infirmary.getPrisoner()) &&
               getRelatedDoctor().equals(infirmary.getRelatedDoctor()) &&
               getDrugName().equals(infirmary.getDrugName()) &&
               getDrugUsageDay().equals(infirmary.getDrugUsageDay()) &&
               getDiseaseType().equals(infirmary.getDiseaseType());
    }

    @Override
    public int hashCode() {
        int result = getPrescriptionNum().hashCode();
        result = 31 * result + getPrisoner().hashCode();
        result = 31 * result + getRelatedDoctor().hashCode();
        result = 31 * result + getDrugName().hashCode();
        result = 31 * result + getDrugUsageDay().hashCode();
        result = 31 * result + getDiseaseType().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "Infirmary{" +
                "prescriptionNum=" + prescriptionNum +
                ", prisoner=" + prisoner +
                ", relatedDoctor='" + relatedDoctor + '\'' +
                ", drugName='" + drugName + '\'' +
                ", drugUsageDay=" + drugUsageDay +
                ", diseaseType='" + diseaseType + '\'' +
                '}';
    }
}