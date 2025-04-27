package com.example.PrisonManagement.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "job")

public class Job {

    @Id
    @Column(name = "job_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer jobId;

    @Column(name = "job_description", length = 15, nullable = false)
    @NotBlank(message = "Job Description is required")
    @Size(max = 15, message = "Description must be up to 15 characters")
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

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Job job)) return false;

        return getJobId().equals(job.getJobId()) &&
                getJobDescription().equals(job.getJobDescription());
    }

    @Override
    public int hashCode() {
        int result = getJobId().hashCode();
        result = 31 * result + getJobDescription().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "Job{" +
                "jobId=" + jobId +
                ", jobDescription='" + jobDescription + '\'' +
                '}';
    }
}