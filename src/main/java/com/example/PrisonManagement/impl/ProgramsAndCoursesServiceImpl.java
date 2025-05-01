package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.ProgramsAndCourses;
import com.example.PrisonManagement.Repository.ProgramsAndCoursesRepository;
import com.example.PrisonManagement.Service.ProgramsAndCoursesService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
@Service
@Transactional
public class ProgramsAndCoursesServiceImpl implements ProgramsAndCoursesService {

    private final ProgramsAndCoursesRepository repository;
    private static final Logger logger = LoggerFactory.getLogger(ProgramsAndCoursesServiceImpl.class);

    @Autowired
    public ProgramsAndCoursesServiceImpl(ProgramsAndCoursesRepository repository) {
        this.repository = Objects.requireNonNull(repository, "ProgramsAndCoursesRepository не должен быть null");
        logger.info("Сервис ProgramsAndCoursesServiceImpl инициализирован с репозиторием {}", repository.getClass().getSimpleName());
    }

    @Override
    @Transactional
    public List<ProgramsAndCourses> getAllCourses() {
        logger.debug("Запрошен список всех курсов (включая удалённые)");
        List<ProgramsAndCourses> list = repository.findAll();
        logger.info("Получено {} курсов", list.size());
        return list;
    }

    @Override
    @Transactional
    public Optional<ProgramsAndCourses> getCourseById(Integer id) {
        logger.debug("Поиск курса по id={}", id);
        return repository.findById(id);
    }

    @Override
    public ProgramsAndCourses createCourse(ProgramsAndCourses course) {
        Objects.requireNonNull(course, "Создаваемый курс не должен быть null");
        course.setDeleted(false);
        ProgramsAndCourses saved = repository.save(course);
        logger.info("Курс успешно создан с id={}", saved.getCourseId());
        return saved;
    }

    @Override
    public Optional<ProgramsAndCourses> updateCourse(Integer id, ProgramsAndCourses courseDetails) {
        logger.debug("Обновление курса с id={}", id);
        return repository.findById(id)
                .map(existing -> {
                    existing.setCourseName(courseDetails.getCourseName());
                    existing.setInstructor(courseDetails.getInstructor());
                    existing.setDeleted(courseDetails.getDeleted());
                    ProgramsAndCourses updated = repository.save(existing);
                    logger.info("Курс с id={} успешно обновлён", id);
                    return updated;
                });
    }

    @Override
    public boolean softDeleteCourse(Integer id) {
        logger.debug("Мягкое удаление (soft delete) курса с id={}", id);
        return repository.findById(id).map(course -> {
            if (Boolean.TRUE.equals(course.getDeleted())) {
                logger.warn("Курс с id={} уже помечен как удалённый", id);
                return false;
            }
            course.setDeleted(true);
            repository.save(course);
            logger.info("Курс с id={} успешно помечен как удалённый", id);
            return true;
        }).orElseGet(() -> {
            logger.warn("Курс с id={} не найден для мягкого удаления", id);
            return false;
        });
    }

    @Override
    public boolean removeCourse(Integer id) {
        logger.debug("Физическое удаление курса с id={}", id);
        if (repository.existsById(id)) {
            repository.deleteById(id);
            logger.info("Курс с id={} успешно удалён физически", id);
            return true;
        }
        logger.warn("Курс с id={} не найден для физического удаления", id);
        return false;
    }

    @Override
    @Transactional
    public Integer getInstructorIdByCourseId(Integer courseId) {
        logger.debug("Получение ID преподавателя для курса с id={}", courseId);
        return repository.findById(courseId)
                .map(course -> {
                    if (course.getInstructor() != null) {
                        Integer instructorId = course.getInstructor().getStaffId();
                        logger.info("Найден преподаватель с id={} для курса с id={}", instructorId, courseId);
                        return instructorId;
                    } else {
                        logger.warn("Преподаватель не найден для курса с id={}", courseId);
                        throw new EntityNotFoundException("Преподаватель не найден для курса с id " + courseId);
                    }
                })
                .orElseThrow(() -> {
                    logger.warn("Курс с id={} не найден", courseId);
                    return new EntityNotFoundException("Курс не найден с id " + courseId);
                });
    }
}