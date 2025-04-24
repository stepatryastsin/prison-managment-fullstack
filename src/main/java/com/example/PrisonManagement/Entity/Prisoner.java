package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "prisoner")
//@todo надо сделать не удаление заключенного а его освобождение soft
public class Prisoner {

    @Id
    @Column(name = "prisoner_id")
    private Integer prisonerId;

    @Column(name = "first_name", nullable = false, length = 15)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 15)
    private String lastName;

    @Column(name = "birth_place", length = 20)
    private String birthPlace;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "occupation", length = 20)
    private String occupation;

    @Column(name = "indictment", length = 50)
    private String indictment;

    @Column(name = "intake_date")
    private LocalDate intakeDate;

    @Column(name = "sentence_end_date")
    private LocalDate sentenceEndDate;

    @ManyToOne
    @JoinColumn(name = "cell_num")
    private Cell cell;

    @ManyToOne
    @JoinColumn(name = "security_level_id")
    private SecurityLevel securityLevel;

    public Prisoner(Integer prisonerId,
                    String firstName,
                    String lastName,
                    String birthPlace,
                    LocalDate dateOfBirth,
                    String occupation,
                    String indictment,
                    LocalDate intakeDate,
                    LocalDate sentenceEndDate,
                    Cell cell,
                    SecurityLevel securityLevel) {
        this.prisonerId = prisonerId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthPlace = birthPlace;
        this.dateOfBirth = dateOfBirth;
        this.occupation = occupation;
        this.indictment = indictment;
        this.intakeDate = intakeDate;
        this.sentenceEndDate = sentenceEndDate;
        this.cell = cell;
        this.securityLevel = securityLevel;
    }

    public Prisoner() {
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getBirthPlace() {
        return birthPlace;
    }

    public void setBirthPlace(String birthPlace) {
        this.birthPlace = birthPlace;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getIndictment() {
        return indictment;
    }

    public void setIndictment(String indictment) {
        this.indictment = indictment;
    }

    public LocalDate getIntakeDate() {
        return intakeDate;
    }

    public void setIntakeDate(LocalDate intakeDate) {
        this.intakeDate = intakeDate;
    }

    public LocalDate getSentenceEndDate() {
        return sentenceEndDate;
    }

    public void setSentenceEndDate(LocalDate sentenceEndDate) {
        this.sentenceEndDate = sentenceEndDate;
    }

    public Cell getCell() {
        return cell;
    }

    public void setCell(Cell cell) {
        this.cell = cell;
    }

    public SecurityLevel getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(SecurityLevel securityLevel) {
        this.securityLevel = securityLevel;
    }

    @Override
    public String toString() {
        return "Prisoner{" +
                "prisonerId=" + prisonerId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", birthPlace='" + birthPlace + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                ", occupation='" + occupation + '\'' +
                ", indictment='" + indictment + '\'' +
                ", intakeDate=" + intakeDate +
                ", sentenceEndDate=" + sentenceEndDate +
                ", cell=" + cell +
                ", securityLevel=" + securityLevel +
                '}';
    }
}