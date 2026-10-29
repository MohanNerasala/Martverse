package com.martverse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class MartverseApplicationTests {

    @Test
    @DisplayName("Spring Boot context loads successfully with test configuration")
    void contextLoads() {
    }
}
