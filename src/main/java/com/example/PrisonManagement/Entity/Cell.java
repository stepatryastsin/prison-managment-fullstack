package com.example.PrisonManagement.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cell")

public class Cell {

    @Id
    @Column(name = "cell_num")
    private Integer cellNum;

    @Column(name = "last_shakedown_date")
    private LocalDate lastShakedownDate;


    public void setLastShakedownDate(LocalDate lastShakedownDate) {
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

    @Override
    public String toString() {
        return "Cell{" +
                "cellNum=" + cellNum +
                ", lastShakedownDate=" + lastShakedownDate +
                '}';
    }
}