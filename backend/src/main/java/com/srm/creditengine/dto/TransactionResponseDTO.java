package com.srm.creditengine.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class TransactionResponseDTO {
    private Long id;
    private Long receivableId;
    private BigDecimal faceValue;
    private String receivableCurrency;
    private String paymentCurrency;
    private BigDecimal presentValue;
    private BigDecimal discount;
    private BigDecimal exchangeRateUsed;
    private LocalDateTime createdAt;
}
