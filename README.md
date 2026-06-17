# SRM Credit Engine - Plataforma de Cessão de Crédito Multimoedas

## 1. Visão Geral do Projeto
O **SRM Credit Engine** é uma solução full-stack para precificação e liquidação de ativos financeiros (duplicatas e cheques pré-datados). O sistema opera em ambiente multimoeda (BRL e USD), aplicando regras de deságio baseadas no risco do ativo através do padrão **Strategy** e garantindo integridade transacional ACID.

## 2. Arquitetura de Infraestrutura
A aplicação utiliza uma infraestrutura conteinerizada com um ponto único de entrada (Proxy Reverso), facilitando a gestão de portas e a segurança.

*   **Ponto de Entrada Único:** [http://localhost:3000](http://localhost:3000)
*   **API Backend:** [http://localhost:3000/api](http://localhost:3000/api)
*   **Documentação Swagger:** [http://localhost:3000/swagger-ui/index.html](http://localhost:3000/swagger-ui/index.html)

---

## 3. Estrutura de Camadas (Backend)
O backend foi construído em Java 17 com Spring Boot 3, utilizando uma arquitetura de três camadas para separação de responsabilidades:

1.  **Camada de Controladores (REST Controller):** Responsável por expor os endpoints da API, realizar a validação de entrada (DTOs) e gerenciar os códigos de status HTTP.
2.  **Camada de Serviço (Service Layer):** Contém a inteligência de negócio. É onde reside o **Motor de Precificação** que utiliza o padrão *Strategy* para calcular o deságio. Aqui também são gerenciadas as transações `@Transactional` para garantir atomicidade.
3.  **Camada de Persistência (Repository Layer):** Interface com o PostgreSQL via Spring Data JPA. Para relatórios e extratos de alta performance, utiliza queries SQL nativas e otimizadas.

---
## 5. Fluxo da Aplicação
O processo operacional segue o fluxo lógico abaixo:

1.  **Entrada de Dados:** O operador insere os dados do título (Valor de Face, Vencimento, Produto e Moeda).
2.  **Simulação:** O sistema consome o *Strategy* correspondente ao produto e a taxa PTAX atual para exibir, em tempo real, o Valor Presente simulado.
3.  **Registro:** Ao confirmar, o título é salvo com status `PENDING`.
4.  **Liquidação:** O operador solicita a liquidação. O sistema executa uma transação ACID que:
    *   Congela a taxa de câmbio do momento (snapshot).
    *   Calcula o deságio final.
    *   Gera o registro na tabela `TRANSACTIONS`.
    *   Atualiza o status do recebível para `LIQUIDATED`.
5.  **Auditoria:** Os dados ficam disponíveis no Extrato Analítico para consulta via filtros avançados.

---

## 6. Modelo de Dados (Diagrama ER)
Abaixo, a modelagem de dados que sustenta a aplicação, garantindo a rastreabilidade entre moedas, taxas, produtos e transações.

![Diagrama de Entidade Relacionamento]

---

## 7. Política de Uso de IA (AI as a Co-Pilot)
Este projeto utilizou Inteligência Artificial como alavanca de produtividade.
*   **Documentação Detalhada:** Consulte o arquivo `AI_USAGE.md` na raiz do projeto para entender quais prompts foram utilizados para o scaffolding da infraestrutura Docker, refatoração de queries SQL e geração de dados de teste.
*   **Análise Crítica:** Toda sugestão da IA passou por revisão técnica rigorosa, garantindo que a lógica financeira e a segurança transacional atendam aos padrões exigidos na documentacao do desafio.

---

## 8. Instruções de Inicialização
1.  Certifique-se de que o Docker esteja rodando.
2.  Execute o comando na raiz:
    ```bash
    docker compose up --build
    ```
3.  Acesse [http://localhost:3000](http://localhost:3000).

---

**Finalidade:** Desafio Técnico 2026
