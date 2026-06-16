package com.srm.creditengine.service.pricing;

import org.springframework.stereotype.Component;

/**
 * Spread de 2.5% a.m. — definido na tabela products (não hardcoded aqui).
 */
@Component
public class ChequePreDatadoStrategy extends AbstractPresentValueStrategy {

    @Override
    public String getProductName() {
        return "Cheque Pré-datado";
    }
}
