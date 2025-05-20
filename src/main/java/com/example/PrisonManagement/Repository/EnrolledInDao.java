package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.EnrolledIn;
import com.example.PrisonManagement.Model.EnrolledInKey;
import com.example.PrisonManagement.Model.Prisoner;
import com.example.PrisonManagement.Model.ProgramsAndCourses;
import com.example.PrisonManagement.Repository.RepInterface.AbstractJdbcDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class EnrolledInDao extends AbstractJdbcDao<EnrolledIn, EnrolledInKey> {

    private static final String TABLE_NAME = "enrolled_in";

    private static final RowMapper<EnrolledIn> MAPPER = (rs, rowNum) -> {
        EnrolledInKey key = new EnrolledInKey(
                rs.getInt("prisoner_id"),
                rs.getInt("course_id")
        );
        EnrolledIn e = new EnrolledIn();
        e.setId(key);

        Prisoner prisoner = new Prisoner();
        prisoner.setPrisonerId(rs.getInt("prisoner_id"));
        e.setPrisoner(prisoner);

        ProgramsAndCourses course = new ProgramsAndCourses();
        course.setCourseId(rs.getInt("course_id"));
        e.setCourse(course);

        return e;
    };

    @Autowired
    public EnrolledInDao(JdbcTemplate jdbc) {
        super(jdbc, TABLE_NAME, "prisoner_id", MAPPER);
    }

    @Override
    public EnrolledIn create(EnrolledIn entity) {
        Map<String, Object> params = entityToParams(entity);
        String cols = String.join(", ", params.keySet());
        String vals = params.keySet().stream()
                .map(c -> ":" + c)
                .collect(Collectors.joining(", "));
        String sql = "INSERT INTO " + TABLE_NAME + " (" + cols + ") VALUES (" + vals + ")";
        new NamedParameterJdbcTemplate(jdbc)
                .update(sql, new MapSqlParameterSource(params));
        return entity;
    }

    @Override
    protected Map<String, Object> entityToParams(EnrolledIn entity) {
        return Map.of(
                "prisoner_id", entity.getId().getPrisonerId(),
                "course_id",   entity.getId().getCourseId()
        );
    }

    @Override
    protected EnrolledInKey extractId(EnrolledIn entity) {
        return entity.getId();
    }

    @Override
    protected void setId(EnrolledIn entity, EnrolledInKey id) {
        entity.setId(id);
    }

    /**
     * Удалить запись по составному ключу
     */
    public void deleteByPrisonerIdAndCourseId(Integer prisonerId, Integer courseId) {
        String sql = """
            DELETE FROM enrolled_in
             WHERE prisoner_id = :prisonerId
               AND course_id   = :courseId
            """;
        var params = new MapSqlParameterSource()
                .addValue("prisonerId", prisonerId)
                .addValue("courseId",   courseId);
        new NamedParameterJdbcTemplate(jdbc).update(sql, params);
    }

    /**
     * Найти все записи для данного course_id
     */
    public List<EnrolledIn> findByCourseId(Integer courseId) {
        String sql = "SELECT prisoner_id, course_id FROM enrolled_in WHERE course_id = :courseId";
        return new NamedParameterJdbcTemplate(jdbc)
                .query(sql,
                        new MapSqlParameterSource("courseId", courseId),
                        MAPPER);
    }

    /**
     * Переопределяем existsById для составного ключа
     */
    @Override
    public boolean existsById(EnrolledInKey key) {
        String sql = """
            SELECT COUNT(1)
              FROM enrolled_in
             WHERE prisoner_id = ?
               AND course_id   = ?
            """;
        Integer cnt = jdbc.queryForObject(
                sql,
                Integer.class,
                key.getPrisonerId(),
                key.getCourseId()
        );
        return cnt != null && cnt > 0;
    }

    /**
     * Переопределяем findById, чтобы учитывать оба поля ключа
     */
    @Override
    public Optional<EnrolledIn> findById(EnrolledInKey key) {
        String sql = """
            SELECT prisoner_id, course_id
              FROM enrolled_in
             WHERE prisoner_id = ?
               AND course_id   = ?
            """;
        List<EnrolledIn> list = jdbc.query(
                sql,
                MAPPER,
                key.getPrisonerId(),
                key.getCourseId()
        );
        return list.isEmpty()
                ? Optional.empty()
                : Optional.of(list.get(0));
    }
}