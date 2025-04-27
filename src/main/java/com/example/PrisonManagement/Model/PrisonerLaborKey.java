package com.example.PrisonManagement.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;


@Embeddable
public class PrisonerLaborKey implements Serializable {

    @NotNull(message = "Prisoner ID is required")
    @Column(name = "prisoner_id", nullable = false)
    private Integer prisonerId;

    @NotNull(message = "Staff ID is required")
    @Column(name = "staff_id", nullable = false)
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

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PrisonerLaborKey that)) return false;

        return getPrisonerId().equals(that.getPrisonerId()) &&
                getStaffId().equals(that.getStaffId());
    }

    @Override
    public int hashCode() {
        int result = getPrisonerId().hashCode();
        result = 31 * result + getStaffId().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "PrisonerLaborKey{" +
                "prisonerId=" + prisonerId +
                ", staffId=" + staffId +
                '}';
    }
}