package com.srm.creditengine.repository;

import com.srm.creditengine.dto.StatementItemDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp; // Import necessário
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class StatementRepository {

    private final EntityManager entityManager;

    public List<StatementItemDTO> findStatement(
            LocalDate startDate,
            LocalDate endDate,
            Long assignorId,
            String paymentCurrencyCode,
            int page,
            int size
    ) {
        StringBuilder sql = new StringBuilder("""
                SELECT
                    t.id,
                    t.created_at,
                    a.name             AS assignor_name,
                    p.name             AS product_name,
                    r.face_value,
                    c_orig.code        AS original_currency,
                    c_pay.code         AS payment_currency,
                    t.present_value,
                    t.discount,
                    t.exchange_rate_used
                FROM transactions t
                JOIN receivables r     ON r.id  = t.receivable_id
                JOIN assignors a       ON a.id  = r.assignor_id
                JOIN products p        ON p.id  = r.product_id
                JOIN currencies c_orig ON c_orig.id = r.currency_id
                JOIN currencies c_pay  ON c_pay.id  = t.payment_currency_id
                WHERE 1=1
                """);

        Map<String, Object> params = new HashMap<>();

        if (startDate != null) {
            sql.append(" AND t.created_at >= :startDate");
            params.put("startDate", startDate.atStartOfDay());
        }
        if (endDate != null) {
            sql.append(" AND t.created_at < :endDate");
            params.put("endDate", endDate.plusDays(1).atStartOfDay());
        }
        if (assignorId != null) {
            sql.append(" AND a.id = :assignorId");
            params.put("assignorId", assignorId);
        }
        if (paymentCurrencyCode != null && !paymentCurrencyCode.isBlank()) {
            sql.append(" AND c_pay.code = :currencyCode");
            params.put("currencyCode", paymentCurrencyCode.toUpperCase());
        }

        sql.append(" ORDER BY t.created_at DESC");

        Query query = entityManager.createNativeQuery(sql.toString());
        params.forEach(query::setParameter);
        query.setFirstResult(page * size);
        query.setMaxResults(size);

        List<Object[]> rows = query.getResultList();

        return rows.stream().map(row -> StatementItemDTO.builder()
                .transactionId(((Number) row[0]).longValue())
                .date(convertToLocalDateTime(row[1])) 
                .assignorName((String) row[2])
                .productName((String) row[3])
                .faceValue((BigDecimal) row[4])
                .originalCurrency((String) row[5])
                .paymentCurrency((String) row[6])
                .presentValue((BigDecimal) row[7])
                .discount((BigDecimal) row[8])
                .exchangeRateUsed(row[9] != null ? (BigDecimal) row[9] : null)
                .build()
        ).toList();
    }

    /**
     * Método auxiliar para converter o retorno do banco (Timestamp) para LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (obj instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        return null;
    }

    public Long countStatement(
            LocalDate startDate,
            LocalDate endDate,
            Long assignorId,
            String paymentCurrencyCode
    ) {
        StringBuilder sql = new StringBuilder("""
                SELECT COUNT(*)
                FROM transactions t
                JOIN receivables r     ON r.id  = t.receivable_id
                JOIN assignors a       ON a.id  = r.assignor_id
                JOIN currencies c_pay  ON c_pay.id = t.payment_currency_id
                WHERE 1=1
                """);

        Map<String, Object> params = new HashMap<>();

        if (startDate != null) {
            sql.append(" AND t.created_at >= :startDate");
            params.put("startDate", startDate.atStartOfDay());
        }
        if (endDate != null) {
            sql.append(" AND t.created_at < :endDate");
            params.put("endDate", endDate.plusDays(1).atStartOfDay());
        }
        if (assignorId != null) {
            sql.append(" AND a.id = :assignorId");
            params.put("assignorId", assignorId);
        }
        if (paymentCurrencyCode != null && !paymentCurrencyCode.isBlank()) {
            sql.append(" AND c_pay.code = :currencyCode");
            params.put("currencyCode", paymentCurrencyCode.toUpperCase());
        }

        Query query = entityManager.createNativeQuery(sql.toString());
        params.forEach(query::setParameter);

        return ((Number) query.getSingleResult()).longValue();
    }
}