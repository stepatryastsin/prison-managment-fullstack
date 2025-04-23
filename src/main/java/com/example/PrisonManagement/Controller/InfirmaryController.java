package com.example.PrisonManagement.Controller;
import com.example.PrisonManagement.Entity.Infirmary;
import com.example.PrisonManagement.Entity.Prisoner;
import com.example.PrisonManagement.Service.InfirmaryService;
import com.example.PrisonManagement.Service.PrisonerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/infirmary")
@CrossOrigin(origins = "http://localhost:3000")
// Bug
public class InfirmaryController {

    private final InfirmaryService infirmaryService;
    private final PrisonerService prisonerService;

    public InfirmaryController(InfirmaryService infirmaryService, PrisonerService prisonerService) {
        this.infirmaryService = infirmaryService;
        this.prisonerService = prisonerService;
    }

    @GetMapping
    public ResponseEntity<List<Infirmary>> getAllInfirmaries() {
        List<Infirmary> infirmaries = infirmaryService.getAllInfirmaries();
        return ResponseEntity.ok(infirmaries);
    }

    @PostMapping
    public ResponseEntity<Infirmary> createInfirmary(@RequestBody Infirmary infirmary) {
        Infirmary savedInfirmary = infirmaryService.createInfirmary(infirmary);
        return ResponseEntity.ok(savedInfirmary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Infirmary> updateInfirmary(@PathVariable Long id, @RequestBody Infirmary infirmary) {
        Infirmary updatedInfirmary = infirmaryService.updateInfirmary(id, infirmary);
        return ResponseEntity.ok(updatedInfirmary);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInfirmary(@PathVariable Long id) {
        infirmaryService.deleteInfirmary(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/prisoner/{id}")
    public ResponseEntity<Prisoner> getPrisonerById(@PathVariable Integer id) {
        Prisoner prisoner = prisonerService.findById(id);
        return ResponseEntity.ok(prisoner);
    }
}