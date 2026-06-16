package com.srm.creditengine.service.pricing;

import com.srm.creditengine.exception.BusinessException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

class PricingStrategyFactoryTest {

    private final PricingStrategyFactory factory = new PricingStrategyFactory(
            List.of(new DuplicataMercantilStrategy(), new ChequePreDatadoStrategy())
    );

    @Test
    void resolvesCorrectStrategy() {
        assertThat(factory.getStrategy("Duplicata Mercantil"))
                .isInstanceOf(DuplicataMercantilStrategy.class);

        assertThat(factory.getStrategy("Cheque Pré-datado"))
                .isInstanceOf(ChequePreDatadoStrategy.class);
    }

    @Test
    void throwsBusinessExceptionForUnknownProduct() {
        assertThatThrownBy(() -> factory.getStrategy("Produto Inexistente"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Produto Inexistente");
    }
}
