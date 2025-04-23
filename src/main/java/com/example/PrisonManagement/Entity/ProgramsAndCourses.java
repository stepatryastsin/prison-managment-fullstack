package com.example.PrisonManagement.Entity;
import jakarta.persistence.*;

@Entity
@Table(name = "programs_and_courses")

public class ProgramsAndCourses {

    @Id
    @Column(name = "course_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer courseId;

    @Column(name = "course_name", length = 50)
    private String courseName;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private Staff instructor;

    @Column(name = "deleted", nullable = false)
    private Boolean deleted = false;

    public ProgramsAndCourses(Integer courseId, String courseName, Staff instructor, Boolean deleted) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.instructor = instructor;
        this.deleted = deleted;
    }

    public ProgramsAndCourses() {
    }

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public Staff getInstructor() {
        return instructor;
    }

    public void setInstructor(Staff instructor) {
        this.instructor = instructor;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }
}