package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "job")

public class Job {

    @Id
    @Column(name = "job_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer jobId;

    @Column(name = "job_description", length = 15)
    private String jobDescription;

    public Job(Integer jobId, String jobDescription) {
        this.jobId = jobId;
        this.jobDescription = jobDescription;
    }

    public Job() {
    }

    public Integer getJobId() {
        return jobId;
    }

    public void setJobId(Integer jobId) {
        this.jobId = jobId;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
}