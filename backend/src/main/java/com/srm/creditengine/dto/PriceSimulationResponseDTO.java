package com.srm.creditengine.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class PriceSimulationResponseDTO {
    private BigDecimal faceValue;
    private String originalCurrency;
    private String paymentCurrency;
    private BigDecimal presentValue;
    private BigDecimal discount;
    private BigDecimal exchangeRateUsed;
    private String productName;
    private Integer termMonths;
}
