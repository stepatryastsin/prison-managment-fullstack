package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "visited_by")

public class VisitedBy {

    @EmbeddedId
    private VisitedByKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Prisoner prisoner;


    @ManyToOne
    @MapsId("visitorId")
    @JoinColumn(name = "visitor_id")
    private Visitor visitor;

    public VisitedBy(VisitedByKey id, Prisoner prisoner, Visitor visitor) {
        this.id = id;
        this.prisoner = prisoner;
        this.visitor = visitor;
    }

    public VisitedBy() {
    }

    public VisitedByKey getId() {
        return id;
    }

    public void setId(VisitedByKey id) {
        this.id = id;
    }

    public Prisoner getPrisoner() {
        return prisoner;
    }

    public void setPrisoner(Prisoner prisoner) {
        this.prisoner = prisoner;
    }

    public Visitor getVisitor() {
        return visitor;
    }

    public void setVisitor(Visitor visitor) {
        this.visitor = visitor;
    }
}
