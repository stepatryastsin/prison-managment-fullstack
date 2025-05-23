package com.example.PrisonManagement.Security;

import java.util.List;
import java.util.Map;

public class UrlRoleMapping {

    /**
     * Карта URL-паттерн → список ролей, которым разрешён доступ.
     * ROLE_ префикс Spring Security добавит автоматически, когда вы вызовете hasAnyRole(...)
     */
    public static final Map<String, List<String>> URL_ROLES = Map.ofEntries(
            // Открытые
            Map.entry("/auth/**",           List.of()),       // permitAll
            Map.entry("/api/properties-in-cells/model/**", List.of()),

            // Админ только
            Map.entry("/staff/**",          List.of("ADMIN")),
            Map.entry("/cells/**",          List.of("ADMIN")),
            Map.entry("/security-levels/**",List.of("ADMIN")),
            Map.entry("/staff/job/**",      List.of("ADMIN")),

            // Уордены
            Map.entry("/prisoners/**",                  List.of("ADMIN","WARDEN","GUARD","LIBRARIAN","MEDIC")),
            Map.entry("/prisoners/prisoner-labor/**",   List.of("ADMIN","WARDEN")),
            Map.entry("/prisoners/properties/**",       List.of("ADMIN","WARDEN","GUARD","LIBRARIAN","MEDIC")),
            Map.entry("/prisoners/courses/**",          List.of("ADMIN","WARDEN")),
            Map.entry("/enrollments-certs/**",          List.of("ADMIN","WARDEN")),
            Map.entry("/visitors/**",                   List.of("ADMIN","WARDEN","GUARD")),
            Map.entry("/visited-by/**",                 List.of("ADMIN","WARDEN","GUARD")),

            // Медик
            Map.entry("/infirmary/**",   List.of("ADMIN","MEDIC")),

            // Библиотекарь
            Map.entry("/library/**",     List.of("ADMIN","LIBRARIAN"))
    );
}