package com.eventra.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.WriteConcernResolver;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

import com.mongodb.WriteConcern;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.bson.types.Decimal128;

/**
 * MongoDB configuration for Eventra.
 *
 * <h3>Production settings (MongoDB Atlas):</h3>
 * <ul>
 *   <li>retryWrites=true&w=majority in connection URI (Atlas default)</li>
 *   <li>TLS/SSL enforced at Atlas cluster level</li>
 *   <li>Connection pooling: maxPoolSize=50 (in URI params)</li>
 *   <li>Read preference: secondaryPreferred for read-heavy endpoints</li>
 * </ul>
 *
 * <h3>Schema design decisions (two-sided marketplace):</h3>
 * <pre>
 * ┌──────────┐    ┌──────────────┐    ┌───────────┐
 * │  User    │◄───│   Company    │    │ Organizer │
 * │(account) │    │  (sponsor)   │    │  (events) │
 * └──────────┘    └──────┬───────┘    └─────┬─────┘
 *                        │                  │
 *                        └──────┬───────────┘
 *                               ▼
 *                  ┌────────────────────────┐
 *                  │  SponsorshipRequest    │──► Messages
 *                  │  (embedded: status,    │──► Payments
 *                  │   timeline events)     │
 *                  └────────────────────────┘
 * </pre>
 *
 * <h3>Embedded vs Referenced:</h3>
 * <ul>
 *   <li><b>Embedded</b>: StatusHistory in SponsorshipRequest (bounded, always read together)</li>
 *   <li><b>Embedded</b>: UnreadCounts in Conversation (atomic update with message)</li>
 *   <li><b>Referenced</b>: Messages → SponsorshipRequest (unbounded growth)</li>
 *   <li><b>Referenced</b>: ConversationMessages → Conversation (unbounded, paginated)</li>
 *   <li><b>Referenced</b>: Payments → SponsorshipRequest (separate lifecycle, compliance)</li>
 * </ul>
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {

    /**
     * Custom converters for BigDecimal ↔ Decimal128 (MongoDB native).
     * Avoids precision loss when storing monetary values.
     */
    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new BigDecimalToDecimal128Converter());
        converters.add(new Decimal128ToBigDecimalConverter());
        return new MongoCustomConversions(converters);
    }

    /**
     * Write concern resolver: MAJORITY for financial documents, ACKNOWLEDGED for others.
     */
    @Bean
    public WriteConcernResolver writeConcernResolver() {
        return action -> {
            String collectionName = action.getCollectionName();
            if ("payments".equals(collectionName) || "sponsorship_requests".equals(collectionName)
                    || "transactions".equals(collectionName) || "disputes".equals(collectionName)) {
                return WriteConcern.MAJORITY;
            }
            return WriteConcern.ACKNOWLEDGED;
        };
    }

    /**
     * MappingMongoConverter with custom conversions.
     * Replaces dots in map keys with underscores to avoid MongoDB key issues.
     */
    @Bean
    public MappingMongoConverter mappingMongoConverter(
            MongoDatabaseFactory factory,
            MongoMappingContext context,
            MongoCustomConversions conversions) {

        var dbRefResolver = new DefaultDbRefResolver(factory);
        var converter = new MappingMongoConverter(dbRefResolver, context);
        converter.setCustomConversions(conversions);
        converter.setMapKeyDotReplacement("_");
        converter.afterPropertiesSet();
        return converter;
    }

    // ─── Custom Converters ─────────────────────────────

    private static class BigDecimalToDecimal128Converter implements Converter<BigDecimal, Decimal128> {
        @Override
        public Decimal128 convert(BigDecimal source) {
            return new Decimal128(source);
        }
    }

    private static class Decimal128ToBigDecimalConverter implements Converter<Decimal128, BigDecimal> {
        @Override
        public BigDecimal convert(Decimal128 source) {
            return source.bigDecimalValue();
        }
    }
}
