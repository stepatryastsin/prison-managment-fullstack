package com.example.PrisonManagement.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class VisitedByKey implements Serializable {

    @Column(name = "prisoner_id")
    private Integer prisonerId;

    @Column(name = "visitor_id")
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
}