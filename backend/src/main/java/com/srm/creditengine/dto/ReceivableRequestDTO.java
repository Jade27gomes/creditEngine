package com.srm.creditengine.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor

public class ReceivableRequestDTO {

    @NotNull(message = "ID do cedente é obrigatório")
    private Long assignorId;

    @NotNull(message = "ID do produto é obrigatório")
    private Long productId;

    @NotBlank(message = "Código da moeda é obrigatório")
    @Size(min = 3, max = 3, message = "Código da moeda deve ter 3 caracteres")
    private String currencyCode;

    @NotNull(message = "Valor face é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor face deve ser positivo")
    private BigDecimal faceValue;

    @NotNull(message = "Data de vencimento é obrigatória")
    @Future(message = "Data de vencimento deve ser no futuro")
    private LocalDate dueDate;

    @NotNull(message = "Prazo é obrigatório")
    @Min(value = 1, message = "Prazo mínimo é 1 mês")
    @Max(value = 360, message = "Prazo máximo é 360 meses")
    private Integer termMonths;
}
