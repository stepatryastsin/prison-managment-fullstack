package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Entity.ProgramsAndCourses;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramsAndCoursesRepository extends JpaRepository<ProgramsAndCourses, Integer> {
    // Метод для получения только активных курсов
    List<ProgramsAndCourses> findAllByDeletedFalse();
}