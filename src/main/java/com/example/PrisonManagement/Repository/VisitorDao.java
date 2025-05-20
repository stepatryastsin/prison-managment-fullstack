package com.example.PrisonManagement.Repository;
import com.example.PrisonManagement.Model.Visitor;
import com.example.PrisonManagement.Repository.RepInterface.AbstractJdbcDao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

@Repository
public class VisitorDao extends AbstractJdbcDao<Visitor, Integer> {
    private static final RowMapper<Visitor> MAPPER = (rs, rn) -> {
        Visitor v = new Visitor();
        v.setVisitorId(rs.getInt("visitor_id"));
        v.setFirstName(rs.getString("first_name"));
        v.setLastName(rs.getString("last_name"));
        v.setPhoneNumber(rs.getString("phone_number"));
        v.setRelationToPrisoner(rs.getString("relation_to_prisoner"));
        Date d = rs.getDate("visit_date");
        v.setVisitDate(d!=null?d.toLocalDate():null);
        return v;
    };

    public VisitorDao(JdbcTemplate jdbc) {
        super(jdbc, "visitor", "visitor_id", MAPPER);
    }

    @Override
    protected Map<String,Object> entityToParams(Visitor v) {
        Map<String,Object> m = new HashMap<>();

        // Только добавляем ID, если он реально задан (например, при update)
        if (v.getVisitorId() != null) {
            m.put("visitor_id", v.getVisitorId());
        }

        m.put("first_name",       v.getFirstName());
        m.put("last_name",        v.getLastName());
        m.put("phone_number",     v.getPhoneNumber());
        m.put("relation_to_prisoner", v.getRelationToPrisoner());
        m.put("visit_date",       v.getVisitDate());

        return m;
    }

    @Override
    protected Integer extractId(Visitor v) {
        return v.getVisitorId();
    }

    @Override
    protected void setId(Visitor v, Integer id) {
        v.setVisitorId(id);
    }

    public boolean existsByPhone(String phone) {
        Integer cnt = jdbc.queryForObject(
                "SELECT COUNT(1) FROM visitor WHERE phone_number = ?",
                Integer.class, phone);
        return cnt!=null && cnt>0;
    }
}