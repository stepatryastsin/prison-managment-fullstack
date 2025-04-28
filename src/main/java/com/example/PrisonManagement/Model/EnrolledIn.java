package com.example.PrisonManagement.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;


@Entity
@Table(name = "enrolled_in")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class EnrolledIn {

    @EmbeddedId
    private EnrolledInKey id;

    @ManyToOne
    @MapsId("prisonerId")
    @JoinColumn(name = "prisoner_id", nullable = false)
    private Prisoner prisoner;

    @ManyToOne
    @MapsId("courseId")
    @JoinColumn(name = "course_id", nullable = false)
    private ProgramsAndCourses course;

    public EnrolledIn(Prisoner prisoner, ProgramsAndCourses course) {
        this.id = new EnrolledInKey(prisoner.getPrisonerId(),course.getCourseId());
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

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EnrolledIn that)) return false;

        return getId().equals(that.getId()) &&
               getPrisoner().equals(that.getPrisoner()) &&
               getCourse().equals(that.getCourse());
    }

    @Override
    public int hashCode() {
        int result = getId().hashCode();
        result = 31 * result + getPrisoner().hashCode();
        result = 31 * result + getCourse().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "EnrolledIn{" +
                "id=" + id +
                ", prisoner=" + prisoner +
                ", course=" + course +
                '}';
    }
}