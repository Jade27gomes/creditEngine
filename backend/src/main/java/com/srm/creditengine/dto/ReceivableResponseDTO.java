package com.srm.creditengine.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ReceivableResponseDTO {
    private Long id;
    private String assignorName;
    private String productName;
    private String currencyCode;
    private BigDecimal faceValue;
    private LocalDate dueDate;
    private Integer termMonths;
    private String status;
    private LocalDateTime createdAt;
}
