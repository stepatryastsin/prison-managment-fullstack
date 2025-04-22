package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "borrowed")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Borrowed {

    @EmbeddedId
    private BorrowedKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id")
    private Prisoner prisoner;

    @ManyToOne
    @JoinColumn(name = "ISBN", insertable = false, updatable = false)
    private Library library;
}