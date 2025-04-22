package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Entity.Visitor;
import com.example.PrisonManagement.Service.VisitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = "http://localhost:3000")
public class VisitorController {

    private final VisitorService visitorService;
    @Autowired
    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }


    @GetMapping
    public List<Visitor> getAllVisitors() {
        return visitorService.getAllVisitor();
    }

    @PostMapping
    public ResponseEntity<Visitor> createVisitor(@RequestBody Visitor visitor) {
        Visitor savedVisitor = visitorService.createVisitor(visitor);
        return ResponseEntity.ok(savedVisitor);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Optional<Visitor>> getPrisonerById(@PathVariable Long id) {
        Optional<Visitor> prisoner = visitorService.getById(id);
        return ResponseEntity.ok(prisoner);
    }
    @PutMapping("/{id}")
    public Optional<Visitor> updateVisitor(@PathVariable Long id, @RequestBody Visitor visitor) {
        return visitorService.updateVisitor(id, visitor);
    }

    @DeleteMapping("/{id}")
    public void deleteVisitor(@PathVariable Long id) {
        visitorService.deleteVisitor(id);
    }
}