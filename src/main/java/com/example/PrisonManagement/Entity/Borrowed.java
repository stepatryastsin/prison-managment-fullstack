package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;


@Entity
@Table(name = "borrowed")

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

    public Borrowed(BorrowedKey id, Prisoner prisoner, Library library) {
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