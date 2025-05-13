package com.example.PrisonManagement.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "borrowed")
public class Borrowed {

    @EmbeddedId
    private BorrowedKey id;

    @MapsId("prisonerId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prisoner_id", nullable = false)
    private Prisoner prisoner;

    @MapsId("libraryId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_id", referencedColumnName = "internal_id", nullable = false)
    private Library library;

    public Borrowed() {}

    public Borrowed(Prisoner prisoner, Library library) {
        this.prisoner = prisoner;
        this.library = library;
        this.id = new BorrowedKey(library.getInternalId(), prisoner.getPrisonerId());
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
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Borrowed)) return false;
        Borrowed that = (Borrowed) o;
        return Objects.equals(id, that.id)
                && Objects.equals(prisoner, that.prisoner)
                && Objects.equals(library, that.library);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, prisoner, library);
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