package com.example.PrisonManagement.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Entity
@Table(name = "prisoner")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
//ready
public class Prisoner {

    @Id
    @Column(name = "prisoner_id")
    private Integer prisonerId;

    @NotBlank(message = "Имя обязательно")
    @Size(max = 15, message = "Имя должно быть не более 15 символов")
    @Column(name = "first_name", nullable = false, length = 15)
    private String firstName;

    @NotBlank(message = "Фамилия обязательна")
    @Size(max = 15, message = "Фамилия должна быть не более 15 символов")
    @Column(name = "last_name", nullable = false, length = 15)
    private String lastName;

    @Size(max = 20, message = "Место рождения должно быть не более 20 символов")
    @Column(name = "birth_place", length = 20)
    private String birthPlace;

    @Past(message = "Дата рождения должна быть в прошлом")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Size(max = 20, message = "Профессия должна быть не более 20 символов")
    @Column(name = "occupation", length = 20)
    private String occupation;

    @Size(max = 50, message = "Обвинение должно быть не более 50 символов")
    @Column(name = "indictment", length = 50)
    private String indictment;

    @PastOrPresent(message = "Дата начала наказания не может быть в будущем")
    @Column(name = "intake_date", nullable = false)
    private LocalDate intakeDate;

    @Future(message = "Дата окончания наказания должна быть в будущем")
    @Column(name = "sentence_end_date", nullable = false)
    private LocalDate sentenceEndDate;

    @ManyToOne
    @JoinColumn(name = "cell_num")
    private Cell cell;

    @ManyToOne
    @JoinColumn(name = "security_level_id", nullable = false)
    @NotNull(message = "Уровень безопасности обязателен")
    private SecurityLevel securityLevel;

    @Column(name = "is_released", nullable = false)
    private Boolean isReleased = false;

    public Prisoner() {
    }

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
                    SecurityLevel securityLevel,
                    Boolean isReleased) {
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
        this.isReleased = isReleased;
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

    public Boolean getReleased() {
        return isReleased;
    }

    public void setReleased(Boolean released) {
        isReleased = released;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Prisoner prisoner)) return false;

        return getPrisonerId().equals(prisoner.getPrisonerId()) &&
                getFirstName().equals(prisoner.getFirstName()) &&
                getLastName().equals(prisoner.getLastName()) &&
                getBirthPlace().equals(prisoner.getBirthPlace()) &&
                getDateOfBirth().equals(prisoner.getDateOfBirth()) &&
                getOccupation().equals(prisoner.getOccupation()) &&
                getIndictment().equals(prisoner.getIndictment()) &&
                getIntakeDate().equals(prisoner.getIntakeDate()) &&
                getSentenceEndDate().equals(prisoner.getSentenceEndDate()) &&
                getCell().equals(prisoner.getCell()) &&
                getSecurityLevel().equals(prisoner.getSecurityLevel()) &&
                isReleased.equals(prisoner.isReleased);
    }

    @Override
    public int hashCode() {
        int result = getPrisonerId().hashCode();
        result = 31 * result + getFirstName().hashCode();
        result = 31 * result + getLastName().hashCode();
        result = 31 * result + getBirthPlace().hashCode();
        result = 31 * result + getDateOfBirth().hashCode();
        result = 31 * result + getOccupation().hashCode();
        result = 31 * result + getIndictment().hashCode();
        result = 31 * result + getIntakeDate().hashCode();
        result = 31 * result + getSentenceEndDate().hashCode();
        result = 31 * result + getCell().hashCode();
        result = 31 * result + getSecurityLevel().hashCode();
        result = 31 * result + isReleased.hashCode();
        return result;
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
                ", isReleased=" + isReleased +
                '}';
    }
}