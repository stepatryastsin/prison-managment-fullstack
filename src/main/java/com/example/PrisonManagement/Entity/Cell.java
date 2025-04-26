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
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cell cell)) return false;

        return getCellNum().equals(cell.getCellNum()) &&
               getLastShakedownDate().equals(cell.getLastShakedownDate());
    }

    @Override
    public int hashCode() {
        int result = getCellNum().hashCode();
        result = 31 * result + getLastShakedownDate().hashCode();
        return result;
    }

    @Override
    public String toString() {
        return "Cell{" +
                "cellNum=" + cellNum +
                ", lastShakedownDate=" + lastShakedownDate +
                '}';
    }
}