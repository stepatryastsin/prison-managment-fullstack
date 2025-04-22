package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "enrolled_in")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrolledIn {

    @EmbeddedId
    private EnrolledInKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id")
    private Prisoner prisoner;

    @ManyToOne
    @MapsId("courseId")
    @JoinColumn(name = "course_id")
    private ProgramsAndCourses course;
}