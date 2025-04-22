package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "own_certificate_from")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnCertificateFrom {

    @EmbeddedId
    private OwnCertificateFromKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id", nullable = true)
    private Prisoner prisoner;

    @ManyToOne
    @MapsId("courseId")
    @JoinColumn(name = "course_id", insertable = false, updatable = false, nullable = true,
            foreignKey = @ForeignKey(name = "fk_owncert_course"))
    private ProgramsAndCourses course;
}