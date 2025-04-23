package com.example.PrisonManagement.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class PrisonerLaborKey implements Serializable {

    @Column(name = "prisoner_id")
    private Integer prisonerId;

    @Column(name = "staff_id")
    private Integer staffId;

    public PrisonerLaborKey(Integer prisonerId, Integer staffId) {
        this.prisonerId = prisonerId;
        this.staffId = staffId;
    }

    public PrisonerLaborKey() {
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    public Integer getStaffId() {
        return staffId;
    }

    public void setStaffId(Integer staffId) {
        this.staffId = staffId;
    }
}