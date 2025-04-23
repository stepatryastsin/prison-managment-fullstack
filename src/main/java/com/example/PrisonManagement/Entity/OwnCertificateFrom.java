package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "own_certificate_from")
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

    public OwnCertificateFrom(OwnCertificateFromKey id, Prisoner prisoner, ProgramsAndCourses course) {
        this.id = id;
        this.prisoner = prisoner;
        this.course = course;
    }

    public OwnCertificateFrom() {
    }

    public OwnCertificateFromKey getId() {
        return id;
    }

    public void setId(OwnCertificateFromKey id) {
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