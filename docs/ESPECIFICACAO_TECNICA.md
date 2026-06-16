# DOCUMENTO DE ESPECIFICAÇÃO TÉCNICA

## Projeto de Plataforma Web de Venda e Gestão de Cookies Temáticos

---

# 1. Informações Gerais

| Campo | Valor |
|---|---|
| Nome do Projeto | SweetAg Cookies |
| Categoria | Web App de Delivery e Gestão de Pedidos |
| Status | Planejamento e Refinamento |
| Versão do Documento | 2.0 |
| Data de Atualização | 21/05/2026 |
| Plataforma | Web App Responsivo (Mobile-First) |

---

## 1.1 Telas Iniciais da Aplicação

Com base nos requisitos documentados, as seguintes telas deverão ser desenvolvidas:

### Interface do Cliente (Mobile-First)
- **Catálogo (Home):** Vitrine principal que lista os cookies temáticos disponíveis, suas descrições resumidas, disponibilidade diária e preços.
- **Detalhes do Produto:** Página focada na experiência do cookie, mostrando a história criativa, ingredientes, tabela nutricional e opção de adicionar ao carrinho.
- **Carrinho e Checkout:** Interface para revisar os itens, alterar quantidades, definir o local exato da entrega (sala, bloco) e validar a reserva temporária de estoque.
- **Cadastro / Autenticação:** Tela de acesso simplificado solicitando WhatsApp e nome, com a opção divertida de gerar nomes automáticos (ex: "Paciente 404"). Solicita também o aceite de notificações.
- **Pagamento (Pix):** Exibe o QR Code e chave Copia e Cola para pagamento, incluindo o temporizador de 30 minutos para confirmar a reserva.
- **Timeline de Acompanhamento:** Visão em tempo real da evolução do pedido com os status cronológicos (Recebido → Preparação → Entrega).
- **Agendamento:** Calendário para clientes encomendarem cookies para datas futuras.
- **Campanha e Comunidade:** Seção dedicada a exibir a barra de progresso humanizada da meta financeira do proprietário.

### Painel Administrativo (Desktop)
- **Login Restrito:** Tela de autenticação exclusiva para a equipe gestora.
- **Dashboard e Relatórios:** Painel central com métricas diárias, evolução da arrecadação, alertas visuais/sonoros e produtos mais vendidos.
- **Gestão de Pedidos e Reservas:** Interface para controle de fluxo: aprovação de comprovantes Pix, mudança de status do pedido e aceitação de encomendas futuras.
- **Gestão de Produtos e Estoque:** Tela (CRUD) para cadastro de novos cookies, edição de temas/preços, configuração de disponibilidade e bloqueio de itens esgotados.

---

# 2. Visão Geral do Produto

O projeto consiste em uma plataforma web híbrida focada na comercialização, gestão operacional e entrega de cookies artesanais dentro de ambientes de proximidade, como universidades, setores empresariais, salas de aula e eventos.

O principal diferencial da plataforma está na criação de uma experiência altamente temática inspirada no universo da psicologia.

Os produtos vendidos não serão apresentados apenas como “cookies tradicionais”, mas sim como experiências temáticas associadas a figuras importantes da psicologia, conceitos psicológicos, cultura pop e elementos criativos relacionados ao comportamento humano.

Exemplos:

- Cookie “Jean Piaget”
- Cookie “Freud Supremo”
- Cookie “Skinner Reforçado”
- Cookie “Paciente 404”
- Cookie “Inconsciente Coletivo”

A plataforma terá foco total em:

- Experiência Mobile-First
- Compra rápida
- Comunicação automatizada
- Atualizações em tempo real
- Branding emocional e divertido
- Integração com notificações
- Gestão simples para os administradores

Além do fluxo tradicional de vendas, o sistema também funcionará como ferramenta de arrecadação para auxiliar financeiramente o proprietário da operação a custear sua participação em eventos acadêmicos relacionados à psicologia.

---

# 3. Objetivos do Sistema

## 3.1 Objetivos Principais

- Permitir vendas rápidas de cookies artesanais.
- Automatizar o fluxo operacional de pedidos.
- Controlar estoque diário e reservas futuras.
- Melhorar comunicação entre cliente e administradores.
- Reduzir atritos no processo de compra.
- Criar uma identidade visual memorável.
- Possibilitar acompanhamento em tempo real.
- Facilitar gestão de entregas internas.

## 3.2 Objetivos Secundários

- Incentivar recompra.
- Criar senso de comunidade.
- Estimular engajamento emocional.
- Criar uma marca temática forte.
- Possibilitar expansão futura para novos produtos.

---

# 4. Público-Alvo

O sistema será utilizado principalmente por:

- Estudantes universitários
- Professores
- Funcionários internos
- Pessoas em ambientes acadêmicos
- Participantes de eventos universitários

O foco inicial será uma faculdade de psicologia.

---

# 5. Conceito Temático e Identidade Visual

A plataforma possuirá uma identidade visual fortemente inspirada em psicologia, comportamento humano e experiências emocionais.

## 5.1 Diretrizes de Branding

O sistema deverá utilizar:

- Linguagem amigável
- Humor leve
- Trocadilhos relacionados à psicologia
- Frases criativas
- Mensagens humanizadas
- Ícones e elementos visuais suaves
- Experiência acolhedora

## 5.2 Aplicações Temáticas

Exemplos de uso:

- “Seu cookie entrou em análise.”
- “Reforço positivo confirmado.”
- “Seu pedido está em sessão.”
- “O inconsciente escolheu chocolate hoje.”
- “Seu comportamento indica necessidade urgente de açúcar.”

## 5.3 Identidade Visual

A marca está definida como **SweetAg Cookies**.
Slogan: "Alimente sua mente. E sua fome."

Paleta: Verde-sálvia #7A9E7E + Bege quente #F5ECD7 + Terracota #C4673A
→ Remete direto à junção das duas áreas. Simples, memorável, fácil de pronunciar.

Itens pendentes de definição:

- Logotipo
- Tipografia principal
- Identidade visual definitiva

---

# 6. Arquitetura Geral do Sistema

O ecossistema será dividido em:

## 6.1 Interface do Cliente

Aplicação Mobile-First voltada para:

- Visualização do catálogo
- Compra de produtos
- Acompanhamento de pedidos
- Recebimento de notificações
- Agendamento de pedidos
- Consulta de status

## 6.2 Painel Administrativo

Painel voltado para desktop contendo:

- Gestão de pedidos
- Controle de estoque
- Cadastro de produtos
- Alteração de status
- Relatórios gerenciais
- Gestão de reservas futuras
- Configuração de disponibilidade
- Controle da campanha/meta financeira

---

# 7. Stack Tecnológica

## 7.1 Frontend

### Angular + TypeScript + SCSS

### Justificativa

Angular foi escolhido devido:

- Estrutura modular robusta
- Escalabilidade
- Controle de estado complexo
- Suporte corporativo
- Facilidade de manutenção
- Integração com RxJS e WebSockets

---

## 7.2 Backend

### Python + FastAPI

### Justificativa

FastAPI foi escolhido devido:

- Alta performance
- Suporte assíncrono
- Facilidade de construção de APIs REST
- Suporte nativo a WebSockets
- Excelente integração com tipagem forte
- Facilidade para integrações futuras

---

## 7.3 Banco de Dados

### PostgreSQL (Neon)

### Justificativa

O PostgreSQL foi escolhido devido:

- Propriedades ACID
- Segurança transacional
- Controle concorrente robusto
- Excelente suporte a relacionamentos
- Facilidade para relatórios
- Escalabilidade futura

Hospedagem do banco:

- Neon Database

---

## 7.4 Infraestrutura

| Serviço | Plataforma |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Banco de Dados | Neon |
| Repositório | GitHub |

---

# 8. Requisitos Funcionais (RF)

# 8.1 Módulo do Cliente

## RF01 - Catálogo Dinâmico:
O sistema deverá listar todos os produtos disponíveis contendo: Nome temático; Descrição temática; Imagem; Informações nutricionais; Quantidade disponível; Preço; Disponibilidade diária.


---

## RF02 - Página Individual do Produto:
Cada produto deverá possuir uma página própria contendo: Nome do cookie; Descrição completa; História/tema do produto; Ingredientes; Informações nutricionais; Fotos adicionais; Disponibilidade; Quantidade restante.


---

## RF03 - Cadastro Simplificado:
O cliente deverá realizar cadastro utilizando: Nome; Número de WhatsApp.


O número de WhatsApp será utilizado como identificador único do usuário.

---

## RF04 - Login Persistente:
O sistema deverá permitir persistência de login utilizando: Tokens JWT; Cookies seguros; Persistência de sessão por até 30 dias.


Objetivo: Reduzir atrito em compras futuras.


---

## RF05 - Nome Automático Opcional:
O sistema deverá permitir que o usuário utilize nomes automáticos gerados dinamicamente.

Possíveis categorias: Psicologia; Cultura pop; Personagens famosos; Identificadores numéricos.


Exemplos: Paciente 404; Freud Anônimo; Usuário 12; Jung Misterioso.


---

## RF06 - Consentimento para Notificações:
No primeiro acesso, o sistema deverá solicitar autorização para: Notificações Push; Mensagens relacionadas ao pedido; Atualizações via WhatsApp.


O consentimento deverá seguir boas práticas de transparência.

---

## RF07 - Carrinho de Compras:
O sistema deverá permitir: Adicionar produtos; Alterar quantidade; Remover itens; Visualizar subtotal; Visualizar disponibilidade.


---

## RF08 - Reserva Temporária de Estoque:
Ao finalizar o pedido: O estoque será temporariamente reservado; O cliente terá até 30 minutos para pagamento; Caso o pagamento não seja confirmado, o estoque retorna automaticamente.


---

## RF09 - Escolha do Local de Entrega:
O cliente deverá informar: Sala; Bloco; Departamento; Referência; Local interno desejado.


---

## RF10 - Pagamento via Pix:
O sistema deverá permitir pagamento via: QR Code Pix; Pix Copia e Cola.


O modelo inicial utilizará confirmação manual.

---

## RF11 - Pedidos Agendados:
O cliente poderá realizar pedidos para datas futuras.

Fluxo: Cliente seleciona data; Pedido entra em “Análise”; Administrador aprova ou recusa; Cliente recebe retorno.


---

## RF12 - Calendário de Disponibilidade:
O sistema deverá exibir um calendário contendo: Dias disponíveis; Sabores previstos; Disponibilidade futura.


As informações serão configuradas manualmente pelos administradores.

---

## RF13 - Timeline em Tempo Real:
O cliente deverá acompanhar o pedido em tempo real.

Status possíveis: Pedido Recebido; Pagamento em Análise; Pedido Confirmado; Em Preparação; Em Rota de Entrega; Entrega Concluída; Pedido Cancelado; Pedido Expirado; Reserva em Análise.


---

## RF14 - Notificações em Tempo Real:
O cliente deverá receber notificações relacionadas ao pedido.

Canais: Web App; Push Notifications; WhatsApp (futuro).


---

## RF15 - Página de Campanha/Meta:
O sistema deverá possuir uma seção visual dedicada à campanha financeira do proprietário.

Objetivos: Mostrar progresso da meta; Incentivar compras; Humanizar a experiência.


Funcionalidades: Barra de progresso; Valor arrecadado; Meta total; Texto motivacional; Atualização automática.


Observação:

A exibição dos valores poderá ser opcional.

---

## RF16 - Botões de Redes Sociais:
O sistema deverá exibir: Botão WhatsApp; Botão Instagram; Links externos oficiais.


---

# 8.2 Módulo Administrativo

## RF17 - Login Administrativo:
Administradores deverão acessar o painel utilizando: Usuário; Senha; Número; E-mail para recuperação.


---

## RF18 - Multiadministradores:
O sistema deverá permitir múltiplos administradores.

Na V1: Todos possuirão as mesmas permissões.


---

## RF19 - Gestão de Produtos:
Administradores deverão poder: Criar produtos; Editar produtos; Excluir produtos; Alterar preços; Adicionar imagens; Editar descrições; Adicionar informações nutricionais; Definir disponibilidade.


---

## RF20 - Gestão de Estoque Diário:
O administrador deverá: Definir estoque diário; Ajustar quantidades; Liberar produtos; Encerrar vendas.


---

## RF21 - Gestão de Pedidos:
O administrador deverá: Aprovar pedidos; Recusar pedidos; Confirmar pagamento; Alterar status; Visualizar histórico.


---

## RF22 - Gestão de Reservas Futuras:
Administradores deverão: Aprovar reservas; Rejeitar reservas; Definir disponibilidade futura.


---

## RF23 - Alertas Operacionais:
O painel deverá emitir: Alertas sonoros; Alertas visuais; Notificações de novos pedidos.


---

## RF24 - Relatórios Gerenciais:
O sistema deverá gerar: Relatórios diários; Relatórios semanais; Relatórios mensais; Produtos mais vendidos; Total arrecadado; Evolução da campanha.


---

# 9. Regras de Negócio (RN)

## RN01 - Estoque Não Pode Ficar Negativo:
O sistema deve impedir vendas acima do estoque disponível.

---

## RN02 - Bloqueio por Esgotamento:
Quando o estoque atingir zero: Produto será marcado como “Esgotado”; Compra será bloqueada.


---

## RN03 - Reserva Temporária de Estoque:
O estoque será reservado temporariamente durante o processo de pagamento.

Prazo: 30 minutos.


---

## RN04 - Expiração Automática:
Caso o pagamento não seja confirmado em até 30 minutos: Pedido expira; Estoque retorna; Cliente é notificado.


---

## RN05 - Ordem Cronológica de Status:
Os status não poderão retroceder.

Fluxo obrigatório:

Recebido → Pagamento → Preparação → Entrega → Conclusão

---

## RN06 - Edição de Local Restrita:
O cliente só poderá alterar local de entrega até o status: Em Preparação.


---

## RN07 - Número de WhatsApp Único:
Cada conta deverá possuir: Um único número de WhatsApp.


---

## RN08 - Consentimento Obrigatório:
O usuário deverá aceitar: Política de notificações; Uso de número de telefone.


---

## RN09 - Aprovação de Pedidos Futuros:
Pedidos futuros deverão passar por aprovação administrativa.

---

## RN10 - Atualização da Meta Financeira:
A barra de progresso da campanha deverá ser atualizada automaticamente após confirmação de pagamento.

---

# 10. Requisitos Não Funcionais (RNF)

## RNF01 - Mobile-First:
Toda experiência do cliente deverá ser otimizada prioritariamente para smartphones.

---

## RNF02 - Responsividade:
O sistema deverá funcionar corretamente em: Smartphones; Tablets; Desktop.


---

## RNF03 - Tempo Real:
Atualizações deverão possuir latência inferior a 2 segundos.

Tecnologia: WebSockets.


---

## RNF04 - Segurança:
O sistema deverá utilizar: HTTPS; JWT; Hash de senhas; Cookies seguros; Proteção básica contra ataques comuns.


---

## RNF05 - Escalabilidade:
A arquitetura deverá permitir: Expansão futura; Novas integrações; Novos meios de pagamento; Expansão operacional.


---

## RNF06 - Persistência de Sessão:
Sessões de usuário deverão permanecer ativas por até 30 dias.

---

## RNF07 - Testes Automatizados:
Fluxos críticos deverão possuir testes automatizados.

Exemplos: Login; Checkout; Pagamento; Alteração de status.


---

# 11. Integrações Externas

## 11.1 WhatsApp

Integração futura utilizando:

- API Oficial da Meta

Possíveis notificações:

- Novo pedido
- Pagamento confirmado
- Pedido em preparação
- Pedido saiu para entrega
- Pedido entregue
- Pedido expirado
- Reserva aprovada
- Reserva recusada

---

## 11.2 Push Notifications

O sistema deverá utilizar notificações push no navegador.

Objetivo:

- Reduzir dependência inicial do WhatsApp.

---

## 11.3 Gateway de Pagamento

Integrações futuras poderão incluir:

- Mercado Pago
- Cartão de crédito
- Pix automático
- Webhooks financeiros

Observação:

Necessita validação futura com cliente.

---

# 12. Estrutura Inicial do Frontend

```text
/frontend
  /src
    /app
      /core
        /services
          - websocket.service.ts
          - api.service.ts
          - auth.service.ts
          - notification.service.ts

      /shared
        /components
          - cookie-card.component.ts
          - progress-campaign.component.ts
          - timeline.component.ts

      /modules
        /catalog
        /product-details
        /checkout
        /auth
        /order-tracking
        /campaign
        /admin-panel
        /future-orders

      - app-routing.module.ts
      - app.component.ts
```

---

# 13. Estrutura Inicial do Backend

```text
/backend
  /app
    /api
    /models
    /schemas
    /services
    /websockets
    /auth
    /notifications
    /payments
    /orders
    /products
    /reports
```

---

# 14. Funcionalidades Futuras (V2)

## Possíveis Evoluções

- Cupons de desconto
- Cashback
- Programa de fidelidade
- Sistema de pontos
- Rastreamento em mapa
- IA para recomendação de sabores
- Integração total com WhatsApp
- Pagamento automático
- Aplicativo mobile nativo
- Múltiplas lojas
- Área de avaliações
- Ranking de clientes
- Gamificação

---

# 15. Considerações Técnicas Importantes

## 15.1 Controle de Concorrência

O backend deverá utilizar:

- Transações ACID
- Locking de registros
- Controle concorrente

Objetivo:

- Evitar venda duplicada do mesmo item.

---

## 15.2 WebSockets

O backend deverá manter conexões persistentes.

Por esse motivo:

- O Render foi escolhido para hospedagem do backend.

---

## 15.3 Estratégia de Estoque

O estoque será:

- Reservado temporariamente.
- Confirmado após pagamento.
- Restaurado automaticamente em caso de expiração.

---

# 16. Pendências de Definição com Cliente

## Itens ainda não definidos

- Logo
- Modelo definitivo de pagamento
- Pix automático ou manual
- Exibição pública da meta financeira
- Valor total da campanha
- Pagamento parcial para reservas futuras
- Política de cancelamento
- Política de reembolso
- Taxas de gateway de pagamento
- Estratégia oficial de notificações WhatsApp

---

# 17. Conclusão

O projeto possui potencial para se tornar uma plataforma altamente diferenciada no mercado universitário devido à combinação entre:

- Branding temático
- Experiência humanizada
- Comunicação divertida
- Operação simplificada
- Gestão em tempo real
- Forte identidade emocional

A proposta ultrapassa um simples sistema de delivery, funcionando também como uma experiência de comunidade, apoio acadêmico e fortalecimento de marca pessoal.

A arquitetura escolhida permite evolução futura sustentável, escalabilidade e integração com novos serviços ao longo do crescimento da operação.

Data de criação do Projeto: 20/05/2026