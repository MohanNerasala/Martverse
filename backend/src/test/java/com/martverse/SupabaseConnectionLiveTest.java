package com.martverse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class SupabaseConnectionLiveTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @Test
    @DisplayName("Verify real Supabase PostgreSQL connection, run seed data, and check tables and seeded products")
    void verifySupabaseConnection() {
        // Query database version
        String version = jdbcTemplate.queryForObject("SELECT version()", String.class);
        System.out.println("==================================================================");
        System.out.println(">>> Connected to Supabase PostgreSQL: " + version);
        System.out.println("==================================================================");
        assertThat(version).isNotNull().contains("PostgreSQL");

        // Run seed.sql cleanly to populate/refresh products and placements
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator(new ClassPathResource("db/seed.sql"));
            populator.setContinueOnError(true);
            populator.execute(dataSource);
            System.out.println(">>> Executed seed.sql to populate Supabase tables");
        } catch (Exception e) {
            System.out.println(">>> Error executing seed.sql: " + e.getMessage());
        }

        // Query categories
        List<Map<String, Object>> cats = jdbcTemplate.queryForList("SELECT id, name, floor_number FROM categories ORDER BY display_order");
        System.out.println(">>> Existing categories in Supabase: " + cats.size());
        for (Map<String, Object> c : cats) {
            System.out.println("    - " + c.get("name") + " (Floor " + c.get("floor_number") + ")");
        }

        // Query supermarket aisles
        List<Map<String, Object>> aisles = jdbcTemplate.queryForList("SELECT id, aisle_number, name FROM supermarket_aisles ORDER BY aisle_number");
        System.out.println(">>> Existing aisles in Supabase: " + aisles.size());
        for (Map<String, Object> a : aisles) {
            System.out.println("    - Aisle #" + a.get("aisle_number") + ": " + a.get("name"));
        }

        // Query products
        List<Map<String, Object>> prods = jdbcTemplate.queryForList("SELECT id, name, price, sku, slug FROM products ORDER BY sku");
        System.out.println(">>> Seeded products count in Supabase: " + prods.size());
        for (Map<String, Object> p : prods) {
            System.out.println("    - " + p.get("sku") + ": " + p.get("name") + " (₹" + p.get("price") + ") [slug=" + p.get("slug") + "]");
        }

        // Query product variants
        List<Map<String, Object>> variants = jdbcTemplate.queryForList("SELECT id, size, color, sku_suffix FROM product_variants");
        System.out.println(">>> Seeded product variants count: " + variants.size());

        // Query 3D placements
        List<Map<String, Object>> placements = jdbcTemplate.queryForList("SELECT id, aisle_id, world_x, world_y, world_z, model_type FROM product_placements");
        System.out.println(">>> Seeded 3D placements count: " + placements.size());

        assertThat(prods.size()).isGreaterThanOrEqualTo(16);
        assertThat(placements.size()).isGreaterThanOrEqualTo(16);
    }
}
