package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.ProgramsAndCourses;
import com.example.PrisonManagement.Service.ProgramsAndCoursesService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ProgramsAndCoursesController {

    private final ProgramsAndCoursesService service;

    // Получить список всех курсов (активных и неактивных)
    @GetMapping
    public ResponseEntity<List<ProgramsAndCourses>> getAllCourses() {
        List<ProgramsAndCourses> courses = service.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    // Получить курс по ID (без фильтрации по активности)
    @GetMapping("/{id}")
    public ResponseEntity<ProgramsAndCourses> getCourseById(@PathVariable Integer id) {
        Optional<ProgramsAndCourses> courseOpt = service.getCourseById(id);
        return courseOpt.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Создать курс (по умолчанию deleted = false)
    @PostMapping
    public ResponseEntity<ProgramsAndCourses> createCourse(@RequestBody ProgramsAndCourses course) {
        ProgramsAndCourses created = service.createCourse(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Обновить курс по ID
    @PutMapping("/{id}")
    public ResponseEntity<ProgramsAndCourses> updateCourse(@PathVariable Integer id,
                                                           @RequestBody ProgramsAndCourses courseDetails) {
        Optional<ProgramsAndCourses> updatedCourse = service.updateCourse(id, courseDetails);
        return updatedCourse.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Получить ID преподавателя по ID курса
    @GetMapping("/{id}/staff")
    public ResponseEntity<Integer> getStaffIdByCourseId(@PathVariable Integer id) {
        try {
            Integer staffId = service.getInstructorIdByCourseId(id);
            return ResponseEntity.ok(staffId);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Физическое (полное) удаление курса
    @DeleteMapping("/{id}/full")
    public ResponseEntity<Void> removeCourse(@PathVariable Integer id) {
        boolean removed = service.removeCourse(id);
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Мягкое удаление курса (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteCourse(@PathVariable Integer id) {
        boolean deleted = service.softDeleteCourse(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Получить статус курса (true = активный, false = удалённый)
    @GetMapping("/{id}/status")
    public ResponseEntity<Boolean> getCourseStatus(@PathVariable Integer id) {
        Optional<ProgramsAndCourses> courseOpt = service.getCourseById(id);
        if (courseOpt.isPresent()) {
            Boolean status = !courseOpt.get().getDeleted();
            return ResponseEntity.ok(status);
        }
        return ResponseEntity.notFound().build();
    }
}