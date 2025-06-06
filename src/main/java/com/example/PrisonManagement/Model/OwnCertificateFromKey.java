package com.example.PrisonManagement.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

@Embeddable

public class OwnCertificateFromKey implements Serializable {

    @NotNull(message = "Prisoner ID is required")
    @Column(name = "prisoner_id", nullable = false)
    private Integer prisonerId;

    @NotNull(message = "Course ID is required")
    @Column(name = "course_id", nullable = false)
    private Integer courseId;

    public OwnCertificateFromKey(Integer prisonerId, Integer courseId) {
        this.prisonerId = prisonerId;
        this.courseId = courseId;
    }

    public OwnCertificateFromKey() {
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OwnCertificateFromKey that)) return false;

        return getPrisonerId().equals(that.getPrisonerId()) && getCourseId().equals(that.getCourseId());
    }

    @Override
    public int hashCode() {
        int result = getPrisonerId().hashCode();
        result = 31 * result + getCourseId().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "OwnCertificateFromKey{" +
                "prisonerId=" + prisonerId +
                ", courseId=" + courseId +
                '}';
    }
}