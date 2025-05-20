package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.ProgramsAndCourses;
import com.example.PrisonManagement.Model.Staff;
import com.example.PrisonManagement.Repository.RepInterface.AbstractJdbcDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Repository
public class ProgramsAndCoursesDao extends AbstractJdbcDao<ProgramsAndCourses, Integer> {

    private static final RowMapper<ProgramsAndCourses> MAPPER = (rs, rowNum) -> {
        ProgramsAndCourses p = new ProgramsAndCourses();
        p.setCourseId(rs.getInt("course_id"));
        p.setCourseName(rs.getString("course_name"));
        p.setDeleted(rs.getBoolean("deleted"));

        Staff instr = new Staff();
        instr.setStaffId(rs.getInt("instructor_id"));
        instr.setFirstName(rs.getString("first_name"));
        instr.setLastName(rs.getString("last_name"));
        p.setInstructor(instr);

        return p;
    };

    @Autowired
    public ProgramsAndCoursesDao(JdbcTemplate jdbc) {
        super(jdbc, "programs_and_courses", "course_id", MAPPER);
    }

    /**
     * Переопределяем findAll(), чтобы подтягивать ФИ преподавателя.
     */
    @Override
    public List<ProgramsAndCourses> findAll() {
        var sql = """
            SELECT 
              p.course_id,
              p.course_name,
              p.instructor_id,
              p.deleted,
              s.first_name,
              s.last_name
            FROM programs_and_courses p
            JOIN staff s ON p.instructor_id = s.staff_id
            """;
        return jdbc.query(sql, MAPPER);
    }

    /**
     * Аналогично переопределяем findById, чтобы JOIN’иться на staff.
     */
    @Override
    public Optional<ProgramsAndCourses> findById(Integer id) {
        var sql = """
            SELECT 
              p.course_id,
              p.course_name,
              p.instructor_id,
              p.deleted,
              s.first_name,
              s.last_name
            FROM programs_and_courses p
            JOIN staff s ON p.instructor_id = s.staff_id
            WHERE p.course_id = ?
            """;
        List<ProgramsAndCourses> list = jdbc.query(sql, MAPPER, id);
        return list.isEmpty()
                ? Optional.empty()
                : Optional.of(list.get(0));
    }

    /**
     * Только активные (deleted=false)
     */
    public List<ProgramsAndCourses> findAllActive() {
        var sql = """
            SELECT 
              p.course_id,
              p.course_name,
              p.instructor_id,
              p.deleted,
              s.first_name,
              s.last_name
            FROM programs_and_courses p
            JOIN staff s ON p.instructor_id = s.staff_id
            WHERE p.deleted = false
            """;
        return jdbc.query(sql, MAPPER);
    }

    @Override
    protected Map<String, Object> entityToParams(ProgramsAndCourses e) {
        Map<String, Object> m = new HashMap<>();
        m.put("course_id",     e.getCourseId());
        m.put("course_name",   e.getCourseName());
        m.put("instructor_id", e.getInstructor().getStaffId());
        m.put("deleted",       e.getDeleted());
        return m;
    }

    @Override
    protected Integer extractId(ProgramsAndCourses e) {
        return e.getCourseId();
    }

    @Override
    protected void setId(ProgramsAndCourses e, Integer id) {
        e.setCourseId(id);
    }
}