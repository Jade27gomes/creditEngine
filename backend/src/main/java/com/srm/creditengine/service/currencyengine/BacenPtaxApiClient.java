package com.srm.creditengine.service.currencyengine;

import com.srm.creditengine.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class BacenPtaxApiClient {

    private final RestClient restClient;
    
    private static final String PTAX_BASE_URL = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)";

    /**
     * Busca a taxa PTAX (Dólar para Real) no portal do Banco Central.
     * @param date Data no formato MM-dd-yyyy
     * @return BigDecimal valor da cotação de venda
     */
    @SuppressWarnings("unchecked")
    public BigDecimal fetchUsdToBrlRate(String date) {
        log.info("Integrando com Bacen PTAX para a data: {}", date);

        
        String url = UriComponentsBuilder.fromUriString(PTAX_BASE_URL)
                .queryParam("@dataCotacao", "'" + date + "'")
                .queryParam("$top", 1)
                .queryParam("$format", "json")
                .queryParam("$select", "cotacaoVenda")
                .toUriString();

        try {
            
            Map<String, Object> response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            
            if (response == null || !response.containsKey("value")) {
                log.error("Resposta do Bacen não contém a chave 'value'. Resposta: {}", response);
                throw new BusinessException("Resposta inválida do Banco Central");
            }

            List<Map<String, Object>> values = (List<Map<String, Object>>) response.get("value");
            
            if (values == null || values.isEmpty()) {
                log.warn("Nenhum valor retornado pelo Bacen para a data: {}", date);
                throw new BusinessException("Cotação PTAX não disponível para a data: " + date);
            }

            
            Object cotacao = values.get(0).get("cotacaoVenda");
            
            if (cotacao == null) {
                log.error("Campo 'cotacaoVenda' está nulo na resposta do Bacen");
                throw new BusinessException("Valor da cotação não encontrado na resposta");
            }

            return new BigDecimal(cotacao.toString());

        } catch (BusinessException e) {
           
            throw e;
        } catch (Exception e) {
            
            log.error("Erro inesperado na comunicação com Banco Central: {}", e.getMessage(), e);
            throw new BusinessException("Falha na integração com o Banco Central");
        }
    }
}