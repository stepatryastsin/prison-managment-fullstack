package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.ProgramsAndCourses;
import com.example.PrisonManagement.Repository.ProgramsAndCoursesRepository;
import com.example.PrisonManagement.Service.ProgramsAndCoursesService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service

public class ProgramsAndCoursesServiceImpl implements ProgramsAndCoursesService {

    private final ProgramsAndCoursesRepository repository;
    private final Logger logger
            = LoggerFactory.getLogger(ProgramsAndCoursesServiceImpl.class);
    public ProgramsAndCoursesServiceImpl(ProgramsAndCoursesRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<ProgramsAndCourses> getAllCourses() {
        return repository.findAll();
    }

    @Override
    public Optional<ProgramsAndCourses> getCourseById(Integer id) {
        return repository.findById(id);
    }

    @Override
    public ProgramsAndCourses createCourse(ProgramsAndCourses course) {
        course.setDeleted(false); // Курс создаётся активным
        ProgramsAndCourses savedCourse = repository.save(course);
        logger.info("Курс создан с id {}", savedCourse.getCourseId());
        return savedCourse;
    }

    @Override
    public Optional<ProgramsAndCourses> updateCourse(Integer id, ProgramsAndCourses courseDetails) {
        return repository.findById(id)
                .map(course -> {
                    course.setCourseName(courseDetails.getCourseName());
                    course.setInstructor(courseDetails.getInstructor());
                    course.setDeleted(courseDetails.getDeleted());
                    ProgramsAndCourses updated = repository.save(course);
                    logger.info("Курс с id {} успешно обновлён", id);
                    return updated;
                });
    }

    @Override
    public boolean softDeleteCourse(Integer id) {
        return repository.findById(id).map(course -> {
            if (Boolean.TRUE.equals(course.getDeleted())) {
                logger.warn("Курс с id {} уже помечен как удалённый", id);
                return false;
            }
            course.setDeleted(true);
            repository.save(course);
            logger.info("Курс с id {} успешно помечен как удалённый (soft delete)", id);
            return true;
        }).orElse(false);
    }

    @Override
    public boolean removeCourse(Integer id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            logger.info("Курс с id {} успешно удалён физически", id);
            return true;
        }
        logger.warn("Курс с id {} не найден для физического удаления", id);
        return false;
    }

    @Override
    public Integer getInstructorIdByCourseId(Integer courseId) {
        return repository.findById(courseId)
                .map(course -> {
                    if (course.getInstructor() != null) {
                        return course.getInstructor().getStaffId();
                    } else {
                        throw new EntityNotFoundException("Преподаватель не найден для курса с id " + courseId);
                    }
                }).orElseThrow(() -> new EntityNotFoundException("Курс не найден с id " + courseId));
    }
}