package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "prisoner_labor")
//ready
public class PrisonerLabor {

    @EmbeddedId
    private PrisonerLaborKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id", nullable = false)
    private Prisoner prisoner;

    @ManyToOne
    @MapsId("staffId")
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    public PrisonerLabor(Prisoner prisoner, Staff staff) {
        this.id = new PrisonerLaborKey(staff.getStaffId(),prisoner.getPrisonerId());
        this.prisoner = prisoner;
        this.staff = staff;
    }

    public PrisonerLabor() {
    }

    public PrisonerLaborKey getId() {
        return id;
    }

    public void setId(PrisonerLaborKey id) {
        this.id = id;
    }

    public Prisoner getPrisoner() {
        return prisoner;
    }

    public void setPrisoner(Prisoner prisoner) {
        this.prisoner = prisoner;
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PrisonerLabor that)) return false;

        return getId().equals(that.getId()) &&
               getPrisoner().equals(that.getPrisoner()) &&
               getStaff().equals(that.getStaff());
    }

    @Override
    public int hashCode() {
        int result = getId().hashCode();
        result = 31 * result + getPrisoner().hashCode();
        result = 31 * result + getStaff().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "PrisonerLabor{" +
                "id=" + id +
                ", prisoner=" + prisoner +
                ", staff=" + staff +
                '}';
    }
}