package com.example.PrisonManagement.Controller;


import com.example.PrisonManagement.Model.Visitor;
import com.example.PrisonManagement.Service.VisitorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = "http://localhost:3000")
public class VisitorController {

    private final VisitorService service;

    @Autowired
    public VisitorController(VisitorService service) {
        this.service = service;
    }

    @GetMapping
    public List<Visitor> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Visitor getOne(@PathVariable Integer id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Visitor create(@RequestBody @Valid Visitor visitor) {
        return service.create(visitor);
    }

    @PutMapping("/{id}")
    public Visitor update(@PathVariable Integer id,
                          @RequestBody @Valid Visitor visitor) {
        return service.update(id, visitor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}