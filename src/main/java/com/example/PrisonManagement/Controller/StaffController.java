package com.example.PrisonManagement.Controller;

import com.example.PrisonManagement.Entity.Staff;
import com.example.PrisonManagement.Service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:3000")
public class StaffController {

    private final StaffService staffService;

    @Autowired
    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public ResponseEntity<List<Staff>> getAllStaff() {
        List<Staff> staffList = staffService.getAllStaff();
        return new ResponseEntity<>(staffList, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Staff>> getStaffById(@PathVariable Integer id) {
        Optional<Staff> staff = staffService.getById(id);
        return ResponseEntity.ok(staff);
    }

    @PostMapping
    public ResponseEntity<Staff> createStaff(@RequestBody Staff staff) {
        Staff createdStaff = staffService.createStaff(staff);
        return new ResponseEntity<>(createdStaff, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Optional<Staff>> updateStaff(@PathVariable Integer id, @RequestBody Staff staff) {
        Optional<Staff> updatedStaff = staffService.updateStaff(id, staff);
        return ResponseEntity.ok(updatedStaff);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable BigDecimal id) {
        staffService.deleteStaff(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}/job")
    public ResponseEntity<Integer> getJobById(@PathVariable Integer id) {
        Optional<Staff> courseOpt = staffService.getById(id);
        if (courseOpt.isPresent() && courseOpt.get().getJob()!= null) {
            Integer staffId = courseOpt.get().getJob().getJobId();
            return ResponseEntity.ok(staffId);
        }
        return ResponseEntity.notFound().build();
    }
}