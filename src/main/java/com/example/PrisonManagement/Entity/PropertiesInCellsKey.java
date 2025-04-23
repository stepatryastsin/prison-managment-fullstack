package com.example.PrisonManagement.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable

public class PropertiesInCellsKey implements Serializable {

    @Column(name = "property_name", length = 25)
    private String propertyName;

    @Column(name = "prisoner_id")
    private Integer prisonerId;

    public PropertiesInCellsKey(String propertyName, Integer prisonerId) {
        this.propertyName = propertyName;
        this.prisonerId = prisonerId;
    }

    public PropertiesInCellsKey() {
    }

    public String getPropertyName() {
        return propertyName;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }
}