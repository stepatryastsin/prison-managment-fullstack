package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "visited_by")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
