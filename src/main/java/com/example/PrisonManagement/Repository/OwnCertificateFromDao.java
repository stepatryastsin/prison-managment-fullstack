package com.example.PrisonManagement.Repository;

import com.example.PrisonManagement.Model.OwnCertificateFrom;
import com.example.PrisonManagement.Model.OwnCertificateFromKey;
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

// OwnCertificateFromDao.java
@Repository
public class OwnCertificateFromDao extends AbstractJdbcDao<OwnCertificateFrom, OwnCertificateFromKey> {

    private static final String TABLE_NAME = "own_certificate_from";

    private static final RowMapper<OwnCertificateFrom> MAPPER = (rs, rowNum) -> {
        OwnCertificateFromKey key = new OwnCertificateFromKey(
                rs.getInt("prisoner_id"),
                rs.getInt("course_id")
        );
        OwnCertificateFrom cert = new OwnCertificateFrom();
        cert.setId(key);

        Prisoner prisoner = new Prisoner();
        prisoner.setPrisonerId(rs.getInt("prisoner_id"));
        cert.setPrisoner(prisoner);

        ProgramsAndCourses course = new ProgramsAndCourses();
        course.setCourseId(rs.getInt("course_id"));
        cert.setCourse(course);

        return cert;
    };

    @Autowired
    public OwnCertificateFromDao(JdbcTemplate jdbc) {
        super(jdbc, TABLE_NAME, "prisoner_id", MAPPER);
    }

    @Override
    public OwnCertificateFrom create(OwnCertificateFrom entity) {
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
    protected Map<String, Object> entityToParams(OwnCertificateFrom entity) {
        return Map.of(
                "prisoner_id", entity.getId().getPrisonerId(),
                "course_id",   entity.getId().getCourseId()
        );
    }

    @Override
    protected OwnCertificateFromKey extractId(OwnCertificateFrom entity) {
        return entity.getId();
    }

    @Override
    protected void setId(OwnCertificateFrom entity, OwnCertificateFromKey id) {
        entity.setId(id);
    }

    /**
     * Удалить запись по составному ключу
     */
    public void deleteByPrisonerIdAndCourseId(Integer prisonerId, Integer courseId) {
        String sql = """
            DELETE FROM own_certificate_from
             WHERE prisoner_id = :prisonerId
               AND course_id   = :courseId
            """;
        var params = new MapSqlParameterSource()
                .addValue("prisonerId", prisonerId)
                .addValue("courseId",   courseId);
        new NamedParameterJdbcTemplate(jdbc).update(sql, params);
    }

    /**
     * Найти все сертификаты для данного course_id
     */
    public List<OwnCertificateFrom> findByCourseId(Integer courseId) {
        String sql = "SELECT prisoner_id, course_id FROM own_certificate_from WHERE course_id = :courseId";
        return new NamedParameterJdbcTemplate(jdbc)
                .query(sql,
                        new MapSqlParameterSource("courseId", courseId),
                        MAPPER);
    }

    /**
     * Переопределяем existsById для составного ключа
     */
    @Override
    public boolean existsById(OwnCertificateFromKey key) {
        String sql = """
            SELECT COUNT(1)
              FROM own_certificate_from
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
    public Optional<OwnCertificateFrom> findById(OwnCertificateFromKey key) {
        String sql = """
            SELECT prisoner_id, course_id
              FROM own_certificate_from
             WHERE prisoner_id = ?
               AND course_id   = ?
            """;
        List<OwnCertificateFrom> list = jdbc.query(
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