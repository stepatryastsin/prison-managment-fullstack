package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;


@Entity
@Table(name = "borrowed")
// ready
public class Borrowed {
    @NotNull(message = "BorrowedKey is required")
    @EmbeddedId
    private BorrowedKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id")
    @NotNull(message = "Prisoner is required")
    private Prisoner prisoner;

    @ManyToOne
    @MapsId("isbn")
    @JoinColumn(name = "isbn")
    @NotNull(message = "Library is required")
    private Library library;

    public Borrowed(BorrowedKey id,
                    Prisoner prisoner,
                    Library library) {
        this.id = id;
        this.prisoner = prisoner;
        this.library = library;
    }

    public Borrowed() {
    }

    public BorrowedKey getId() {
        return id;
    }

    public void setId(BorrowedKey id) {
        this.id = id;
    }

    public Prisoner getPrisoner() {
        return prisoner;
    }

    public void setPrisoner(Prisoner prisoner) {
        this.prisoner = prisoner;
    }

    public Library getLibrary() {
        return library;
    }

    public void setLibrary(Library library) {
        this.library = library;
    }

    @Override
    public String toString() {
        return "Borrowed{" +
                "id=" + id +
                ", prisoner=" + prisoner +
                ", library=" + library +
                '}';
    }
}