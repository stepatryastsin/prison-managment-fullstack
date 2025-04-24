package com.example.PrisonManagement.Entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

@Entity
@Table(name = "cell")
//ready
public class Cell {

    @Id
    @Column(name = "cell_num")
    @Positive(message = "Cell Id must be positive")
    private Integer cellNum;

    @PastOrPresent
    @Column(name = "last_shakedown_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING,
                pattern = "yyyy-MM-dd")
    private LocalDate lastShakedownDate;


    public Cell(Integer cellNum,
                LocalDate lastShakedownDate) {
        this.cellNum = cellNum;
        this.lastShakedownDate = lastShakedownDate;
    }

    public Cell() {
    }

    public Integer getCellNum() {
        return cellNum;
    }

    public void setCellNum(Integer cellNum) {
        this.cellNum = cellNum;
    }

    public LocalDate getLastShakedownDate() {
        return lastShakedownDate;
    }

    public void setLastShakedownDate(LocalDate lastShakedownDate) {
        this.lastShakedownDate = lastShakedownDate;
    }

    @Override
    public String toString() {
        return "Cell{" +
                "cellNum=" + cellNum +
                ", lastShakedownDate=" + lastShakedownDate +
                '}';
    }
}