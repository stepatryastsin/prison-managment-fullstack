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
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class ProgramsAndCoursesController {

    private final ProgramsAndCoursesService service;
    private static final Logger logger = LoggerFactory.getLogger(ProgramsAndCoursesController.class);

    @Autowired
    public ProgramsAndCoursesController(ProgramsAndCoursesService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ProgramsAndCourses>> getAll() {
        return ResponseEntity.ok(service.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramsAndCourses> getById(@PathVariable Integer id) {
        return service.getCourseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProgramsAndCourses> create(@Valid @RequestBody ProgramsAndCourses c) {
        ProgramsAndCourses created = service.createCourse(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramsAndCourses> update(
            @PathVariable Integer id,
            @Valid @RequestBody ProgramsAndCourses d) {
        return service.updateCourse(id, d)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDelete(@PathVariable Integer id) {
        return service.softDeleteCourse(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}/full")
    public ResponseEntity<Void> hardDelete(@PathVariable Integer id) {
        return service.removeCourse(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<Boolean> status(@PathVariable Integer id) {
        return service.getCourseById(id)
                .map(c -> ResponseEntity.ok(!c.getDeleted()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/staff")
    public ResponseEntity<Integer> getStaff(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.getInstructorIdByCourseId(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}