package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "prisoner_labor")

public class PrisonerLabor {

    @EmbeddedId
    private PrisonerLaborKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id")
    private Prisoner prisoner;

    @ManyToOne
    @MapsId("staffId")
    @JoinColumn(name = "staff_id")
    private Staff staff;

    public PrisonerLabor(PrisonerLaborKey id, Prisoner prisoner, Staff staff) {
        this.id = id;
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
}