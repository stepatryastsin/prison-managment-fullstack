package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.VisitedBy;
import com.example.PrisonManagement.Entity.VisitedByKey;
import com.example.PrisonManagement.Service.VisitedByService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/visited-by")
@CrossOrigin(origins = "http://localhost:3000")
public class VisitedByController {

    @Autowired
    private VisitedByService visitedByService;

    // Получить список всех записей
    @GetMapping
    public List<VisitedBy> getAll() {
        return visitedByService.findAll();
    }

    // Получить запись по составному ключу
    @GetMapping("/{prisonerId}/{visitorId}")
    public ResponseEntity<VisitedBy> getById(@PathVariable Integer prisonerId,
                                             @PathVariable Integer visitorId) {
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        Optional<VisitedBy> visitedBy = visitedByService.findById(key);
        return visitedBy.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VisitedBy> create(@RequestBody VisitedBy visitedBy) {
        VisitedBy created = visitedByService.save(visitedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    @PutMapping("/{prisonerId}/{visitorId}")
    public ResponseEntity<VisitedBy> update(@PathVariable Integer prisonerId,
                                            @PathVariable Integer visitorId,
                                            @RequestBody VisitedBy visitedBy) {
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        if (!visitedByService.existsById(key)) {
            return ResponseEntity.notFound().build();
        }
        visitedBy.setId(key);
        VisitedBy updated = visitedByService.save(visitedBy);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{prisonerId}/{visitorId}")
    public ResponseEntity<Void> delete(@PathVariable Integer prisonerId,
                                       @PathVariable Integer visitorId) {
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        if (!visitedByService.existsById(key)) {
            return ResponseEntity.notFound().build();
        }
        visitedByService.deleteById(key);
        return ResponseEntity.noContent().build();
    }
}