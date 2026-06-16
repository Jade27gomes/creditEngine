package com.srm.creditengine.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor

public class StatementItemDTO {
    private Long transactionId;
    private LocalDateTime date;
    private String assignorName;
    private String productName;
    private BigDecimal faceValue;
    private String originalCurrency;
    private String paymentCurrency;
    private BigDecimal presentValue;
    private BigDecimal discount;
    private BigDecimal exchangeRateUsed;
}