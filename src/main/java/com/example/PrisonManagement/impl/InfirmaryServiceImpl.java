package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Infirmary;
import com.example.PrisonManagement.Repository.InfirmaryDao;
import com.example.PrisonManagement.Service.InfirmaryService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@Transactional
public class InfirmaryServiceImpl implements InfirmaryService {

    private final InfirmaryDao dao;

    public InfirmaryServiceImpl(InfirmaryDao dao) {
        this.dao = dao;
    }

    @Override
    public List<Infirmary> findAll() {
        return dao.findAll();
    }

    @Override
    public Infirmary findById(Integer prescriptionNum) {
        return dao.findById(prescriptionNum)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Infirmary record with prescriptionNum=" + prescriptionNum + " not found"));
    }

    @Override
    public Infirmary findByPrisonerId(Integer prisonerId) {
        return dao.findByPrisonerId(prisonerId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Infirmary record for prisonerId=" + prisonerId + " not found"));
    }

    @Override
    public Infirmary createOrUpdate(Infirmary infirmary) {
        Integer prescNum = infirmary.getPrescriptionNum();
        if (prescNum == null) {
            // create new
            return dao.create(infirmary);
        } else {
            // update existing
            if (!dao.existsById(prescNum)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cannot update non-existent prescriptionNum=" + prescNum);
            }
            // ensure prisonerId matches if needed, or copy values
            return dao.update(infirmary);
        }
    }

    @Override
    public Infirmary update(Integer prescriptionNum, Infirmary infirmary) {
        Infirmary existing = findById(prescriptionNum);
        // replace all updatable fields
        existing.setPrisoner(infirmary.getPrisoner());
        existing.setRelatedDoctor(infirmary.getRelatedDoctor());
        existing.setDrugName(infirmary.getDrugName());
        existing.setDrugUsageDay(infirmary.getDrugUsageDay());
        existing.setDiseaseType(infirmary.getDiseaseType());
        return dao.update(existing);
    }

    @Override
    public void deleteByPrescriptionNum(Integer prescriptionNum) {
        if (!dao.existsById(prescriptionNum)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Infirmary record with prescriptionNum=" + prescriptionNum + " not found");
        }
        dao.delete(prescriptionNum);
    }

    @Override
    public void deleteByPrisonerId(Integer prisonerId) {
        if (!dao.existsByPrisonerId(prisonerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No infirmary record for prisonerId=" + prisonerId);
        }
        dao.deleteByPrisonerId(prisonerId);
    }
}