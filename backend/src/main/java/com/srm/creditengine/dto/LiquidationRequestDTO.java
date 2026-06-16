package com.srm.creditengine.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor

public class LiquidationRequestDTO {

    @NotNull(message = "ID do recebível é obrigatório")
    private Long receivableId;

    @NotBlank(message = "Moeda de pagamento é obrigatória")
    @Size(min = 3, max = 3, message = "Código da moeda deve ter 3 caracteres")
    private String paymentCurrencyCode;
}
