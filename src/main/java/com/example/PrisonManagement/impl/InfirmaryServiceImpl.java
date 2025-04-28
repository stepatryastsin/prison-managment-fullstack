package com.example.PrisonManagement.impl;

import com.example.PrisonManagement.Model.Infirmary;
import com.example.PrisonManagement.Repository.InfirmaryRepository;
import com.example.PrisonManagement.Service.InfirmaryService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@Transactional
public class InfirmaryServiceImpl implements InfirmaryService {

    private final InfirmaryRepository repo;

    @Autowired
    public InfirmaryServiceImpl(InfirmaryRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<Infirmary> findAll() {
        return repo.findAll();
    }

    @Override
    public Infirmary findById(Integer prescriptionNum) {
        return repo.findById(prescriptionNum)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Запись prescriptionNum=" + prescriptionNum + " не найдена"
                ));
    }

    @Override
    public Infirmary findByPrisonerId(Integer prisonerId) {
        return repo.findByPrisoner_PrisonerId(prisonerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Запись для prisonerId=" + prisonerId + " не найдена"
                ));
    }

    @Override
    public Infirmary createOrUpdate(Infirmary infirmary) {
        Integer pid = infirmary.getPrisoner().getPrisonerId();
        return repo.findByPrisoner_PrisonerId(pid)
                .map(existing -> {
                    existing.setRelatedDoctor(infirmary.getRelatedDoctor());
                    existing.setDrugName(infirmary.getDrugName());
                    existing.setDrugUsageDay(infirmary.getDrugUsageDay());
                    existing.setDiseaseType(infirmary.getDiseaseType());
                    return repo.save(existing);
                })
                .orElseGet(() -> repo.save(infirmary));
    }

    @Override
    public Infirmary update(Integer prescriptionNum, Infirmary infirmary) {
        Infirmary existing = findById(prescriptionNum);
        existing.setRelatedDoctor(infirmary.getRelatedDoctor());
        existing.setDrugName(infirmary.getDrugName());
        existing.setDrugUsageDay(infirmary.getDrugUsageDay());
        existing.setDiseaseType(infirmary.getDiseaseType());
        return repo.save(existing);
    }

    @Override
    public void deleteByPrescriptionNum(Integer prescriptionNum) {
        if (!repo.existsById(prescriptionNum)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Запись prescriptionNum=" + prescriptionNum + " не найдена"
            );
        }
        repo.deleteById(prescriptionNum);
    }

    @Override
    public void deleteByPrisonerId(Integer prisonerId) {
        if (!repo.existsByPrisoner_PrisonerId(prisonerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Запись для prisonerId=" + prisonerId + " не найдена"
            );
        }
        repo.deleteByPrisoner_PrisonerId(prisonerId);
    }
}