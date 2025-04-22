package com.example.PrisonManagement.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertiesInCellsKey implements Serializable {

    @Column(name = "property_name", length = 25)
    private String propertyName;

    @Column(name = "prisoner_id")
    private Integer prisonerId;
}