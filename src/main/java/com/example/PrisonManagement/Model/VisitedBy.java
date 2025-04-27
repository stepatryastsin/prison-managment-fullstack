package com.example.PrisonManagement.Model;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;


@Entity
@Table(name = "visited_by")
//ready
public class VisitedBy {

    @EmbeddedId
    private VisitedByKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Prisoner prisoner;

    @ManyToOne
    @MapsId("visitorId")
    @JoinColumn(name = "visitor_id", nullable = false)
    private Visitor visitor;

    public VisitedBy(Prisoner prisoner, Visitor visitor) {
        this.id = new VisitedByKey(prisoner.getPrisonerId(), visitor.getVisitorId());
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

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VisitedBy visitedBy)) return false;

        return getId().equals(visitedBy.getId()) &&
                getPrisoner().equals(visitedBy.getPrisoner()) &&
                getVisitor().equals(visitedBy.getVisitor());
    }

    @Override
    public int hashCode() {
        int result = getId().hashCode();
        result = 31 * result + getPrisoner().hashCode();
        result = 31 * result + getVisitor().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "VisitedBy{" +
                "id=" + id +
                ", prisoner=" + prisoner +
                ", visitor=" + visitor +
                '}';
    }
}
