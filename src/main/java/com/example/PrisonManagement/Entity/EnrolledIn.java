package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;


@Entity
@Table(name = "enrolled_in")

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

    public EnrolledIn(EnrolledInKey id, Prisoner prisoner, ProgramsAndCourses course) {
        this.id = id;
        this.prisoner = prisoner;
        this.course = course;
    }

    public EnrolledIn() {
    }

    public EnrolledInKey getId() {
        return id;
    }

    public void setId(EnrolledInKey id) {
        this.id = id;
    }

    public Prisoner getPrisoner() {
        return prisoner;
    }

    public void setPrisoner(Prisoner prisoner) {
        this.prisoner = prisoner;
    }

    public ProgramsAndCourses getCourse() {
        return course;
    }

    public void setCourse(ProgramsAndCourses course) {
        this.course = course;
    }
}