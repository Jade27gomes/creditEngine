package com.srm.creditengine.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_rates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ExchangeRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "from_currency_id")
    private Currency fromCurrency;
    @ManyToOne(optional = false)
    @JoinColumn(name = "to_currency_id")
    private Currency toCurrency;
    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal rate;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
