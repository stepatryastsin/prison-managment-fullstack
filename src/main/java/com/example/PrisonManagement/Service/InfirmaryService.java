package com.example.PrisonManagement.Service;
import com.example.PrisonManagement.Model.Infirmary;

import java.util.List;
import java.util.Optional;

public interface InfirmaryService {

    List<Infirmary> findAll();

    Infirmary findById(Integer prescriptionNum);

    Infirmary findByPrisonerId(Integer prisonerId);

    Infirmary createOrUpdate(Infirmary infirmary);

    Infirmary update(Integer prescriptionNum, Infirmary infirmary);

    void deleteByPrescriptionNum(Integer prescriptionNum);

    void deleteByPrisonerId(Integer prisonerId);

}