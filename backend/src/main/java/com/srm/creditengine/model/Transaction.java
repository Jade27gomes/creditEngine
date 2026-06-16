package com.srm.creditengine.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "receivable_id", unique = true)
    private Receivable receivable;

    @ManyToOne(optional = false)
    @JoinColumn(name = "payment_currency_id")
    private Currency paymentCurrency;

    @Column(name = "present_value", nullable = false, precision = 19, scale = 6)
    private BigDecimal presentValue;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal discount;

    @Column(name = "exchange_rate_used", precision = 19, scale = 6)
    private BigDecimal exchangeRateUsed;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Version // Optimistic Locking — evita race condition em liquidações concorrentes
    private Long version;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
