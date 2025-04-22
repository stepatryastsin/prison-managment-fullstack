package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "programs_and_courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    // Поле для мягкого удаления (soft delete flag)
    @Column(name = "deleted", nullable = false)
    private Boolean deleted = false;
}