package com.example.PrisonManagement.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.Set;
@Entity
@Table(name = "cell")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cell {

    @Id
    @Column(name = "cell_num")
    private Integer cellNum;

    @Column(name = "last_shakedown_date")
    private LocalDate lastShakedownDate;
}