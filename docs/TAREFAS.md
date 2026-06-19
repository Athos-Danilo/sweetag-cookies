# 📋 Checklist de Tarefas - SweetAg Cookies

Este documento funciona como um guia de acompanhamento (To-Do List) para a implementação completa da plataforma **SweetAg Cookies**. Ele foi construído com base nas especificações técnicas, regras de negócio e arquitetura estabelecidas no projeto.

> [!IMPORTANT]
> A implementação deve seguir a arquitetura definida (FastAPI no Backend + Angular no Frontend) e respeitar as restrições e regras de negócio de controle de estoque e tempo de reserva.

---

## 🗺️ Mapa de Progresso Geral

- [ ] **Fase 1: Modelagem e Banco de Dados (PostgreSQL + SQLAlchemy)**
- [/] **Fase 2: Backend e APIs REST / WebSockets (FastAPI)**
- [/] **Fase 3: Frontend - Módulo do Cliente (Angular)**
- [ ] **Fase 4: Frontend - Painel Administrativo (Angular)**
- [ ] **Fase 5: Integrações, Segurança e Testes**

---

## 🗄️ Fase 1: Modelagem e Banco de Dados
Mapeamento dos dados necessários no PostgreSQL via SQLAlchemy.

- [ ] **M1.1: Modelo de Usuário (`User`)**
  - [x] WhatsApp como identificador único (RN07) - *Já implementado*
  - [x] Nome e aceitação de notificações - *Já implementado*
- [ ] **M1.2: Modelo de Produtos e Sabores (`Product`)**
  - [ ] Campos: ID, Nome temático, Descrição temática, História/Branding temático, Ingredientes, Tabela nutricional (JSON), Imagem URL, Preço, Quantidade em estoque, Disponibilidade diária (Boolean), Ativo (Boolean).
- [ ] **M1.3: Modelo de Pedidos e Itens (`Order` & `OrderItem`)**
  - [ ] Tabela `orders`: ID, ID Usuário, Código Pix gerado, Status do pedido (Enum), Sala, Bloco, Departamento, Referência (Local de entrega interna - RF09), Data de criação, Data de expiração da reserva (created_at + 30 min - RN03), Tipo de pedido (Imediato ou Agendado).
  - [ ] Tabela `order_items`: ID, ID Pedido, ID Produto, Quantidade, Preço Unitário.
  - [ ] Enum de status: `RECEBIDO`, `PAGAMENTO_ANALISE`, `CONFIRMADO`, `PREPARACAO`, `ROTA_ENTREGA`, `CONCLUIDO`, `CANCELADO`, `EXPIRADO`, `RESERVA_ANALISE` (RF13).
- [ ] **M1.4: Modelo de Calendário/Disponibilidade Futura (`Availability`)**
  - [ ] Campos: ID, Data, ID Produto, Quantidade máxima de encomendas permitida.
- [ ] **M1.5: Modelo de Campanha/Meta Financeira (`CampaignState`)**
  - [ ] Campos: ID, Meta total (R$), Valor atual arrecadado (R$), Texto motivacional, Mostrar valores publicamente (Boolean) (RF15).

---

## ⚡ Fase 2: Backend & APIs (FastAPI)
Lógica de negócios e endpoints REST + WebSockets.

### 2.1 Módulo de Autenticação (`auth`)
- [x] Cadastro simplificado de cliente (WhatsApp e nome) (RF03)
- [x] Login persistente com JWT (RF04)
- [x] Implementação de gerador divertido de nomes automáticos de psicologia (ex: "Freud Anônimo", "Paciente 404", "Jung Misterioso") para registro (RF05).
- [ ] Autenticação restrita para administradores (RF17) e permissões de acesso (RF18).

### 2.2 Módulo de Produtos (`products`)
- [ ] Endpoints públicos (Cliente):
  - [ ] `GET /api/products`: Lista todos os cookies ativos com estoque e dados do catálogo (RF01).
  - [ ] `GET /api/products/{id}`: Retorna os detalhes de um cookie específico, história e tabela nutricional (RF02).
- [ ] Endpoints protegidos (Admin - CRUD completo) (RF19):
  - [ ] `POST /api/products`: Criação de novo sabor temático.
  - [ ] `PUT /api/products/{id}`: Edição de dados do cookie.
  - [ ] `DELETE /api/products/{id}`: Desativação (soft delete) do cookie.
  - [ ] `PATCH /api/products/{id}/stock`: Ajuste manual e rápido de estoque diário (RF20).

### 2.3 Módulo de Pedidos (`orders`) e Regras de Estoque
- [ ] Endpoint `POST /api/orders`: Criação de pedido imediato.
  - [ ] Validação de estoque garantido antes de reservar (RN01).
  - [ ] Bloqueio ACID / Transação segura de concorrência para evitar venda dupla (RN01, RN02, Considerações 15.1).
  - [ ] Decremento do estoque físico e marcação do timestamp de expiração (30 min) (RF08, RN03).
- [ ] Tarefa em segundo plano (Background Task / Worker):
  - [ ] Verificador periódico que expira pedidos com status `RECEBIDO` que passaram de 30 minutos sem confirmação de pagamento.
  - [ ] Lógica de expiração: Altera status para `EXPIRADO`, devolve a quantidade dos itens ao estoque e notifica o cliente (RN04).
- [ ] Endpoint `PATCH /api/orders/{id}/address`: Permite ao cliente alterar bloco/sala se o status do pedido for menor ou igual a `PREPARACAO` (RN06).

### 2.4 Módulo de Pagamento manual via Pix (`payments`)
- [ ] Endpoint `GET /api/orders/{id}/pix`: Retorna QR Code Pix estático (ou dinâmico gerado) e chave Copia e Cola.
- [ ] Endpoint `POST /api/orders/{id}/pay`: Envio de confirmação de pagamento manual pelo cliente (ex: indicação de que o Pix foi feito).

### 2.5 Módulo de Agendamentos Futuros (`future-orders`)
- [ ] Endpoint `POST /api/orders/schedule`: Cria pedido agendado para data futura.
  - [ ] Criação do pedido com status `RESERVA_ANALISE` (RN09).
  - [ ] Consulta ao calendário de disponibilidade para validar o agendamento (RF12).
- [ ] Endpoint `GET /api/availability/calendar`: Retorna o calendário de disponibilidade dos sabores para os próximos dias.

### 2.6 Módulo Administrativo & Relatórios (`reports` / `admin-panel`)
- [ ] Endpoints protegidos para o Admin:
  - [ ] `GET /api/admin/orders`: Listagem de todos os pedidos ativos e históricos.
  - [ ] `PATCH /api/admin/orders/{id}/status`: Alteração de status manual do pedido (RF21). Deve validar que os status não retrocedem (RN05).
  - [ ] `POST /api/admin/orders/{id}/approve-pix`: Confirmação manual de pagamento (muda status para `CONFIRMADO` e atualiza a meta financeira) (RF21, RN10).
  - [ ] `POST /api/admin/orders/{id}/approve-reserve`: Aprovação ou rejeição de reservas futuras (RF22).
  - [ ] `GET /api/admin/dashboard`: Métricas de faturamento diário, semanal, mensal e cookies mais vendidos (RF24).
  - [ ] `PUT /api/admin/campaign`: Edição dos valores e textos da campanha (metas).

### 2.7 WebSockets e Comunicação em Tempo Real (`websockets`)
- [ ] Gerenciador de Conexões WebSocket no backend:
  - [ ] Envio automático de atualizações de status para a conexão do cliente quando o admin alterar o status do pedido (Timeline Real-time - RF13, RNF03).
  - [ ] Canal WebSocket para o Painel Administrativo que envia alertas sonoros/visuais instantâneos quando um novo pedido ou comprovante Pix é enviado (RF23).

---

## 📱 Fase 3: Frontend - Módulo do Cliente (Angular)
Interface responsiva e dinâmica (Mobile-First) (RNF01, RNF02).

### 3.1 Autenticação e Configuração Inicial (`auth` & `core`)
- [/] Tela de Autenticação / Cadastro (`auth`):
  - [x] Campo WhatsApp com máscara e validação.
  - [x] Campo Nome do cliente.
  - [x] Botão de "Gerar Nome Psi Dinâmico" (RF05).
  - [ ] Banner/Modal solicitando consentimento de notificações Push e WhatsApp (RF06, RN08).
- [x] Guardas de rota e interceptadores JWT (`core/services/auth.service.ts`):
  - [x] Persistência da sessão do cliente no LocalStorage por 30 dias (RF04, RNF06).

### 3.2 Catálogo Dinâmico e Campanha (`homepage`)
- [/] Vitrine de Cookies (`cookie-card`):
  - [/] Layout fluido mostrando fotos dos cookies e o branding temático e bem-humorado de psicologia (Implementado temporariamente na homepage com mock).
  - [ ] Badge visual se o produto estiver esgotado (RN02).
  - [x] Botão de adicionar rápido ao carrinho.
- [ ] Barra de Progresso da Campanha (`progress-campaign`):
  - [ ] Exibição visual do progresso financeiro do proprietário para congressos.
  - [ ] Valores formatados e textos motivacionais baseados na API.
- [x] Rota/Modal de Detalhes do Cookie (`product-details`):
  - [x] História completa com humor, ingredientes e informações nutricionais (RF02) (Implementado via ProductModalComponent).

### 3.3 Carrinho de Compras e Checkout (`cart` / `checkout`)
- [/] Visualização do Carrinho (`cart`):
  - [x] Listagem de itens, alteração de quantidades, exclusão e cálculo de subtotal.
- [/] Formulário de Checkout / Local de Entrega:
  - [x] Campos específicos de entrega interna: Bloco, Sala, Departamento, Ponto de Referência (RF09).
  - [ ] Escolha de agendamento (Calendário) vs. Entrega imediata (RF11).
  - [ ] Validação de estoque antes do fechamento do pedido.

### 3.4 Pagamento e Timeline de Acompanhamento (`order-tracking`)
- [ ] Tela de Pagamento Pix:
  - [ ] Exibição do QR Code Pix e botão "Copiar Chave Pix".
  - [ ] Temporizador visual de 30 minutos em contagem regressiva (RF08, RN03).
  - [ ] Botão "Já Realizei o Pagamento" para notificar o admin.
- [ ] Timeline Reativa (`timeline.component.ts`):
  - [ ] Exibição cronológica e temática dos status do pedido (ex: "Seu cookie entrou em análise", "Reforço positivo confirmado!").
  - [ ] Conectado ao `WebsocketService` para transição imediata de status sem necessidade de recarregar a tela (RF13, RNF03).

---

## 💻 Fase 4: Frontend - Painel Administrativo (Angular)
Interface responsiva otimizada para desktop.

### 4.1 Login e Acesso Administrativo (`admin-panel/login`)
- [ ] Tela de Login dedicada para admins com e-mail/usuário e senha (RF17).
- [ ] Guarda de rotas `AdminGuard` para blindar o painel administrativo.

### 4.2 Dashboard Executivo (`admin-panel/dashboard`)
- [ ] Painel central:
  - [ ] Gráficos simples ou indicadores de faturamento (diário, semanal, mensal) (RF24).
  - [ ] Progresso atual da campanha de arrecadação.
  - [ ] Cards com cookies campeões de venda.
- [ ] Painel de Alertas Sonoros e Visuais:
  - [ ] Notificação sonora (beep/alarme) ao receber novos pedidos ou solicitações de pagamento Pix (RF23).

### 4.3 Gestão de Pedidos e Entregas (`admin-panel/orders`)
- [ ] Listagem ativa de pedidos com filtro de status.
- [ ] Ações rápidas:
  - [ ] Botão para visualizar comprovante Pix e aprovar pagamento manual (RF21).
  - [ ] Botão para avançar status do pedido (Preparação ➡️ Rota de Entrega ➡️ Concluído) (RN05).
  - [ ] Botão para cancelar pedido.
  - [ ] Visualização das informações de entrega interna (Bloco, Sala, etc.).

### 4.4 Gestão de Produtos e Calendário (`admin-panel/products`)
- [ ] Tabela com listagem de sabores temáticos.
- [ ] Modais de Criação e Edição (CRUD) de Cookies (RF19).
- [ ] Toggle rápido para ativar/desativar cookies e zerar/ajustar estoque diário (RF20).
- [ ] Configuração do calendário de datas futuras e sabores disponíveis para encomendas agendadas (RF12, RF22).

---

## 🔒 Fase 5: Integrações, Segurança e Testes

### 5.1 Notificações e Canais
- [ ] Implementação de Notificações Web Push via Service Worker para avisos de status do pedido quando a aba do app estiver fechada (RF14, RF06).
- [ ] Mock de envio de notificações via WhatsApp (para simulação de futuras integrações oficiais) (Capítulo 11.1).

### 5.2 Segurança e Concorrência
- [ ] Proteção de rotas REST com autenticação Bearer JWT no FastAPI.
- [ ] Configuração de HTTPS e cookies HTTP-only para armazenar tokens caso necessário.
- [ ] Teste de estresse simples de transação ACID no banco Neon para garantir que dois usuários não comprem o mesmo cookie esgotando o estoque (RN01, RN02).

### 5.3 Testes Automatizados (RNF07)
- [ ] Testes unitários no backend (FastAPI com pytest):
  - [ ] Testar fluxo de reserva de estoque e expiração após 30 minutos.
  - [ ] Testar barreira de estoque negativo.
- [ ] Testes no frontend (Angular):
  - [ ] Testar conexão do WebSocket e resposta da timeline.
