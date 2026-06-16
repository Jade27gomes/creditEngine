package com.srm.creditengine.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "receivables")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Receivable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "assignor_id")
    private Assignor assignor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(optional = false)
    @JoinColumn(name = "currency_id")
    private Currency currency;

    @Column(name = "face_value", nullable = false, precision = 19, scale = 6)
    private BigDecimal faceValue;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "term_months", nullable = false)
    private Integer termMonths;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, LIQUIDATED, CANCELLED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
