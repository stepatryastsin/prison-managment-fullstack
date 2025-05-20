package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.ProgramsAndCourses;
import com.example.PrisonManagement.Repository.EnrolledInDao;
import com.example.PrisonManagement.Repository.OwnCertificateFromDao;
import com.example.PrisonManagement.Repository.ProgramsAndCoursesDao;
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

    private final ProgramsAndCoursesDao courseRepo;
    private final EnrolledInDao enrollRepo;
    private final OwnCertificateFromDao certRepo;
    private static final Logger logger = LoggerFactory.getLogger(ProgramsAndCoursesServiceImpl.class);

    public ProgramsAndCoursesServiceImpl(
            ProgramsAndCoursesDao courseRepo,
            EnrolledInDao enrollRepo,
            OwnCertificateFromDao certRepo) {
        this.courseRepo = Objects.requireNonNull(courseRepo, "ProgramsAndCoursesDao must not be null");
        this.enrollRepo = Objects.requireNonNull(enrollRepo,      "EnrolledInDao must not be null");
        this.certRepo   = Objects.requireNonNull(certRepo,        "OwnCertificateFromDao must not be null");
        logger.info("ProgramsAndCoursesServiceImpl initialized");
    }

    @Override
    public List<ProgramsAndCourses> getAllCourses() {
        logger.info("Fetching all courses");
        List<ProgramsAndCourses> list = courseRepo.findAll();
        logger.info("Found {} courses", list.size());
        return list;
    }

    @Override
    public Optional<ProgramsAndCourses> getCourseById(Integer id) {
        logger.info("Fetching course by id={}", id);
        return courseRepo.findById(id);
    }

    @Override
    public ProgramsAndCourses createCourse(ProgramsAndCourses c) {
        Objects.requireNonNull(c, "Course must not be null");
        c.setDeleted(false);
        ProgramsAndCourses created = courseRepo.create(c);
        logger.info("Created course with id={}", created.getCourseId());
        return created;
    }

    @Override
    public Optional<ProgramsAndCourses> updateCourse(Integer id, ProgramsAndCourses d) {
        logger.info("Updating course id={}", id);
        return courseRepo.findById(id).map(existing -> {
            existing.setCourseName(d.getCourseName());
            existing.setInstructor(d.getInstructor());
            existing.setDeleted(d.getDeleted());
            ProgramsAndCourses updated = courseRepo.update(existing);
            logger.info("Course id={} updated", id);
            return updated;
        });
    }

    @Override
    public boolean softDeleteCourse(Integer id) {
        logger.info("Soft-deleting course id={}", id);
        return courseRepo.findById(id).map(c -> {
            if (Boolean.TRUE.equals(c.getDeleted())) {
                logger.warn("Course id={} already soft-deleted", id);
                return false;
            }
            c.setDeleted(true);
            courseRepo.update(c);
            logger.info("Course id={} marked deleted", id);
            return true;
        }).orElse(false);
    }

    @Override
    public boolean removeCourse(Integer id) {
        logger.info("Hard-deleting course id={}", id);
        if (!courseRepo.existsById(id)) {
            logger.warn("Course id={} not found for hard delete", id);
            return false;
        }
        // удаляем все enrollments
        enrollRepo.findByCourseId(id)
                .forEach(e -> enrollRepo.deleteByPrisonerIdAndCourseId(
                        e.getId().getPrisonerId(),
                        e.getId().getCourseId()));
        // удаляем все certificates
        certRepo.findByCourseId(id)
                .forEach(c -> certRepo.deleteByPrisonerIdAndCourseId(
                        c.getId().getPrisonerId(),
                        c.getId().getCourseId()));
        // удаляем сам курс
        courseRepo.delete(id);
        logger.info("Course id={} and all relations removed", id);
        return true;
    }

    @Override
    public Integer getInstructorIdByCourseId(Integer courseId) {
        return courseRepo.findById(courseId)
                .map(c -> {
                    if (c.getInstructor() == null) {
                        logger.warn("Instructor not set for course id={}", courseId);
                        throw new EntityNotFoundException("Instructor not found for course " + courseId);
                    }
                    return c.getInstructor().getStaffId();
                })
                .orElseThrow(() -> {
                    logger.warn("Course id={} not found", courseId);
                    throw new EntityNotFoundException("Course not found " + courseId);
                });
    }
}