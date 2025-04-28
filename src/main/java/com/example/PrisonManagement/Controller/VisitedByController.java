package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Model.VisitedBy;
import com.example.PrisonManagement.Model.VisitedByKey;
import com.example.PrisonManagement.Service.VisitedByService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/visited-by")
@CrossOrigin(origins = "http://localhost:3000")
public class VisitedByController {

    private final VisitedByService visitedByService;

    @Autowired
    public VisitedByController(VisitedByService visitedByService) {
        this.visitedByService = visitedByService;
    }

    @GetMapping
    public List<VisitedBy> getAll() {
        return visitedByService.findAll();
    }

    @GetMapping("/{prisonerId}/{visitorId}")
    public VisitedBy getById(@PathVariable Integer prisonerId,
                             @PathVariable Integer visitorId) {
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        return visitedByService.findById(key);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VisitedBy create(@RequestBody VisitedBy visitedBy) {
        return visitedByService.create(visitedBy);
    }

    @PutMapping("/{prisonerId}/{visitorId}")
    public VisitedBy update(@PathVariable Integer prisonerId,
                            @PathVariable Integer visitorId,
                            @RequestBody VisitedBy visitedBy) {
        return visitedByService.update(prisonerId, visitorId, visitedBy);
    }

    @DeleteMapping("/{prisonerId}/{visitorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer prisonerId,
                       @PathVariable Integer visitorId) {
        VisitedByKey key = new VisitedByKey(prisonerId, visitorId);
        visitedByService.deleteById(key);
    }
}
