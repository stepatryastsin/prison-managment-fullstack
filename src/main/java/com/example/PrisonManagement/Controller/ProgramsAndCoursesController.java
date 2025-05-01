package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.ProgramsAndCourses;
import com.example.PrisonManagement.Service.ProgramsAndCoursesService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class ProgramsAndCoursesController {
    private final ProgramsAndCoursesService service;
    private static final Logger logger = LoggerFactory.getLogger(ProgramsAndCoursesController.class);

    @Autowired
    public ProgramsAndCoursesController(ProgramsAndCoursesService service) {
        this.service = Objects.requireNonNull(service, "ProgramsAndCoursesService не должен быть null");
        logger.info("ProgramsAndCoursesController инициализирован");
    }

    @GetMapping
    public ResponseEntity<List<ProgramsAndCourses>> getAllCourses() {
        logger.debug("Запрошен список всех курсов");
        List<ProgramsAndCourses> courses = service.getAllCourses();
        logger.info("Отправлено {} курсов", courses.size());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramsAndCourses> getCourseById(@PathVariable Integer id) {
        logger.debug("Запрошен курс по id={}", id);
        Optional<ProgramsAndCourses> courseOpt = service.getCourseById(id);
        return courseOpt.map(course -> {
                    logger.info("Курс с id={} найден", id);
                    return ResponseEntity.ok(course);
                })
                .orElseGet(() -> {
                    logger.warn("Курс с id={} не найден", id);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                });
    }

    @PostMapping
    public ResponseEntity<ProgramsAndCourses> createCourse(
            @RequestBody @Valid ProgramsAndCourses course) {
        logger.debug("Запрос на создание курса: {}", course);
        ProgramsAndCourses created = service.createCourse(course);
        logger.info("Курс создан с id={}", created.getCourseId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramsAndCourses> updateCourse(
            @PathVariable Integer id,
            @RequestBody @Valid ProgramsAndCourses courseDetails) {
        logger.debug("Запрос на обновление курса id={}: {}", id, courseDetails);
        Optional<ProgramsAndCourses> updatedOpt = service.updateCourse(id, courseDetails);
        return updatedOpt.map(updated -> {
                    logger.info("Курс с id={} успешно обновлён", id);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> {
                    logger.warn("Курс с id={} не найден для обновления", id);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                });
    }

    @GetMapping("/{id}/staff")
    public ResponseEntity<Integer> getStaffIdByCourseId(@PathVariable Integer id) {
        logger.debug("Запрошен ID преподавателя для курса id={}", id);
        try {
            Integer staffId = service.getInstructorIdByCourseId(id);
            logger.info("Для курса id={} найден преподаватель id={}", id, staffId);
            return ResponseEntity.ok(staffId);
        } catch (EntityNotFoundException e) {
            logger.warn("При поиске преподавателя для курса id={} ошибка: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}/full")
    public ResponseEntity<Void> removeCourse(@PathVariable Integer id) {
        logger.debug("Запрошено физическое удаление курса id={}", id);
        boolean removed = service.removeCourse(id);
        if (removed) {
            logger.info("Курс id={} физически удалён", id);
            return ResponseEntity.noContent().build();
        } else {
            logger.warn("Курс id={} не найден для физического удаления", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteCourse(@PathVariable Integer id) {
        logger.debug("Запрошено мягкое удаление (soft delete) курса id={}", id);
        boolean deleted = service.softDeleteCourse(id);
        if (deleted) {
            logger.info("Курс id={} успешно помечен как удалённый", id);
            return ResponseEntity.noContent().build();
        } else {
            logger.warn("Курс id={} не найден или уже удалён", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Boolean> getCourseStatus(@PathVariable Integer id) {
        logger.debug("Запрошен статус курса id={}", id);
        Optional<ProgramsAndCourses> courseOpt = service.getCourseById(id);
        return courseOpt.map(course -> {
                    boolean active = !course.getDeleted();
                    logger.info("Статус курса id={}: {}", id, active ? "активен" : "удалён");
                    return ResponseEntity.ok(active);
                })
                .orElseGet(() -> {
                    logger.warn("Курс id={} не найден при запросе статуса", id);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                });
    }

}