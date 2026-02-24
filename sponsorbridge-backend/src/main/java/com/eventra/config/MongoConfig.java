package com.eventra.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB auditing configuration.
 * Enables @CreatedDate and @LastModifiedDate auto-population.
 * Separated from main application class to avoid issues with @WebMvcTest slicing.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
