package com.example.PrisonManagement.Controller;
import com.example.PrisonManagement.Model.Infirmary;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Service.InfirmaryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/infirmary")
@CrossOrigin(origins = "http://localhost:3000")
public class InfirmaryController {

    private final InfirmaryService service;

    @Autowired
    public InfirmaryController(InfirmaryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Infirmary> getAll() {
        return service.findAll();
    }

    @GetMapping("/{prescriptionNum}")
    public Infirmary getById(@PathVariable Integer prescriptionNum) {
        return service.findById(prescriptionNum);
    }

    @GetMapping("/prisoner/{prisonerId}")
    public Prisoner getPrisoner(@PathVariable Integer prisonerId) {
        return service.findByPrisonerId(prisonerId).getPrisoner();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public Infirmary createOrUpdate(@RequestBody @Valid Infirmary infirmary) {
        return service.createOrUpdate(infirmary);
    }

    @PutMapping("/{prescriptionNum}")
    public Infirmary update(@PathVariable Integer prescriptionNum,
                            @RequestBody @Valid Infirmary infirmary) {
        return service.update(prescriptionNum, infirmary);
    }

    @DeleteMapping("/{prescriptionNum}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteByPrescriptionNum(@PathVariable Integer prescriptionNum) {
        service.deleteByPrescriptionNum(prescriptionNum);
    }

    @DeleteMapping("/prisoner/{prisonerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteByPrisoner(@PathVariable Integer prisonerId) {
        service.deleteByPrisonerId(prisonerId);
    }
}