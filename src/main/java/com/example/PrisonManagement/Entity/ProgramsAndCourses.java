package com.example.PrisonManagement.Entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


@Entity
@Table(name = "programs_and_courses")
//ready
public class ProgramsAndCourses {

    @Id
    @Column(name = "course_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer courseId;

    @NotBlank(message = "Course name is required")
    @Size(max = 50, message = "Course name must be ≤50 characters")
    @Column(name = "course_name", nullable = false)
    private String courseName;

    @ManyToOne
    @JoinColumn(name = "instructor_id", nullable = false)
    @NotNull(message = "Instructor is required")
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

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProgramsAndCourses that)) return false;

        return getCourseId().equals(that.getCourseId()) &&
                getCourseName().equals(that.getCourseName()) &&
                getInstructor().equals(that.getInstructor()) &&
                getDeleted().equals(that.getDeleted());
    }

    @Override
    public int hashCode() {
        int result = getCourseId().hashCode();
        result = 31 * result + getCourseName().hashCode();
        result = 31 * result + getInstructor().hashCode();
        result = 31 * result + getDeleted().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "ProgramsAndCourses{" +
                "courseId=" + courseId +
                ", courseName='" + courseName + '\'' +
                ", instructor=" + instructor +
                ", deleted=" + deleted +
                '}';
    }
}