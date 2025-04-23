package com.example.PrisonManagement.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;


import java.io.Serializable;

@Embeddable
public class EnrolledInKey implements Serializable {

    @Column(name = "prisoner_id")
    private Integer prisonerId;

    @Column(name = "course_id")
    private Integer courseId;

    public EnrolledInKey(Integer prisonerId, Integer courseId) {
        this.prisonerId = prisonerId;
        this.courseId = courseId;
    }

    public EnrolledInKey() {
    }

    public Integer getPrisonerId() {
        return prisonerId;
    }

    public void setPrisonerId(Integer prisonerId) {
        this.prisonerId = prisonerId;
    }

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }
}