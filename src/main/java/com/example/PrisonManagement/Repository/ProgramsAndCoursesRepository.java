package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.ProgramsAndCourses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ProgramsAndCoursesRepository extends JpaRepository<ProgramsAndCourses, Integer> {

    List<ProgramsAndCourses> findAllByDeletedFalse();
}