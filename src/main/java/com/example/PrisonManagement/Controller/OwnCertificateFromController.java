package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Service.OwnCertificateFromService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ownCertificateFrom")
@CrossOrigin(origins = "http://localhost:3000")
public class OwnCertificateFromController {

    private final OwnCertificateFromService service;

    @Autowired
    public OwnCertificateFromController(OwnCertificateFromService service) {
        this.service = service;
    }

    @GetMapping
    public List<OwnCertificateFrom> getAll() {
        return service.findAll();
    }

    @GetMapping("/{prisonerId}/{courseId}")
    public OwnCertificateFrom getOne(@PathVariable Integer prisonerId,
                                     @PathVariable Integer courseId) {
        return service.findById(prisonerId, courseId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OwnCertificateFrom create(@RequestBody @Valid OwnCertificateFrom ownCertificate) {
        return service.create(ownCertificate);
    }

    @PutMapping("/{prisonerId}/{courseId}")
    public OwnCertificateFrom update(@PathVariable Integer prisonerId,
                                     @PathVariable Integer courseId,
                                     @RequestBody @Valid OwnCertificateFrom ownCertificate) {
        return service.update(prisonerId, courseId, ownCertificate);
    }

    @DeleteMapping("/{prisonerId}/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prisonerId,
                       @PathVariable Integer courseId) {
        service.delete(prisonerId, courseId);
    }
}