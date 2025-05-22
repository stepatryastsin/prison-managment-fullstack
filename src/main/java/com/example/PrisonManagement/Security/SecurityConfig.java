package com.example.PrisonManagement.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthProvider(StaffDetailsService userDetailsService) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, DaoAuthenticationProvider daoAuthProvider) throws Exception {
        http
                .cors().and().csrf().disable()
                .authenticationProvider(daoAuthProvider)
                .authorizeHttpRequests(auth -> auth
                        // Открытые эндпоинты
                        .requestMatchers("/auth/**").permitAll()

                        // Публичный доступ к 3D-моделям
                        .requestMatchers("/api/properties-in-cells/model/**").permitAll()

                        // Только ADMIN
                        .requestMatchers(
                                "/staff/**",
                                "/cells/**",
                                "/security-levels/**",
                                "/staff/job/**"
                        ).hasRole("ADMIN")

                        // WARDEN: общие и специализированные маршруты
                        .requestMatchers(
                                "/prisoners/**",
                                "/prisoners/prisoner-labor/**",
                                "/prisoners/properties/**",
                                "/prisoners/courses/**",
                                "/enrollments-certs/**",
                                "/visitors/**",
                                "/visited-by/**"
                        ).hasRole("WARDEN")

                        // MEDIC: только медицинские предписания
                        .requestMatchers("/infirmary/**").hasRole("MEDIC")

                        // LIBRARIAN: только библиотечные ресурсы
                        .requestMatchers(
                                "/library/**",
                                "/prisoners/**",
                                "/prisoners/properties/**"
                        ).hasRole("LIBRARIAN")

                        // GUARD: обход камер и посетители
                        .requestMatchers(
                                "/visitors/**",
                                "/visited-by/**",
                                "/cells/**",
                                "/security-levels/**",
                                "/prisoners/**",
                                "/prisoners/properties/**"
                        ).hasRole("GUARD")

                        // Все остальные — авторизованы
                        .anyRequest().authenticated()
                )
                .securityContext(ctx -> ctx.requireExplicitSave(false))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:3000"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}