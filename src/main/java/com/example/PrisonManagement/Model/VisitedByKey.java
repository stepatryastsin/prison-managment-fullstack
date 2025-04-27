package com.example.PrisonManagement.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;


import java.io.Serializable;
import java.util.Objects;

@Embeddable
//ready
public class VisitedByKey implements Serializable {
    @Column(name = "prisoner_id", nullable = false)
    private Integer prisonerId;

    @Column(name = "visitor_id", nullable = false)
    private Integer visitorId;

    public VisitedByKey(Integer prisonerId, Integer visitorId) {
        this.prisonerId = prisonerId;
        this.visitorId = visitorId;
    }

    public VisitedByKey() {
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    public Integer getVisitorId() {
        return visitorId;
    }

    public void setVisitorId(Integer visitorId) {
        this.visitorId = visitorId;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VisitedByKey that)) return false;

        return Objects.equals(getPrisonerId(), that.getPrisonerId()) &&
               Objects.equals(getVisitorId(), that.getVisitorId());
    }

    @Override
    public int hashCode() {
        int result = Objects.hashCode(getPrisonerId());
        result = 31 * result + Objects.hashCode(getVisitorId());
        return result;
    }

    @Override
    public String toString() {
        return "VisitedByKey{" +
                "prisonerId=" + prisonerId +
                ", visitorId=" + visitorId +
                '}';
    }
}