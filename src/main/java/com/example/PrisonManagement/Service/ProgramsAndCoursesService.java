package com.example.PrisonManagement.Service;

import com.example.PrisonManagement.Entity.Job;
import com.example.PrisonManagement.Entity.ProgramsAndCourses;

import java.util.List;
import java.util.Optional;

public interface ProgramsAndCoursesService {
    List<ProgramsAndCourses> getAllCourses();
    Optional<ProgramsAndCourses> getCourseById(Integer id);
    ProgramsAndCourses createCourse(ProgramsAndCourses course);
    Optional<ProgramsAndCourses> updateCourse(Integer id, ProgramsAndCourses courseDetails);
    boolean softDeleteCourse(Integer id);  // Мягкое удаление (soft delete)
    boolean removeCourse(Integer id);        // Физическое удаление (hard delete)
    Integer getInstructorIdByCourseId(Integer courseId);
}