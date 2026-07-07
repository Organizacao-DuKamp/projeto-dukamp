# Equipe de Vendas — Plano

## Estimativa de créditos
Operação média (nova tabela + migration + 4 componentes + 2 rotas + 1 CRUD admin + ajuste de navbar). Estimo **~6–8 créditos**. Como passa de 5, **aguardo sua confirmação** antes de executar.

## O que será construído

### 1. Banco de dados (migration)
Nova tabela `public.sellers`:
- `name`, `role` (cargo), `region` (cidade/UF), `phone`, `whatsapp`, `photo_url`, `banner_url` (opcional), `active` (bool), `display_order` (int), `slug` (único, gerado do nome)
- RLS: leitura pública apenas de `active = true`; escrita só para admin (`has_role`)
- GRANTs corretos para `anon` (SELECT) / `authenticated` / `service_role`
- Trigger `updated_at`

### 2. Navbar
Adicionar o item **"Equipe de Vendas"** apontando para `/equipe-de-vendas` em `src/lib/navbar-settings.ts` (`DEFAULT_NAV_ITEMS`), substituindo o atual "Equipe de Vendas" que hoje aponta pra `/contato`.

### 3. Rotas públicas
- `src/routes/equipe-de-vendas.index.tsx` — grid responsivo de vendedores ativos ordenados por `display_order`. Card mostra foto (frame circular) + nome + cargo + cidade. SEO head próprio.
- `src/routes/equipe-de-vendas.$slug.tsx` — página de perfil com o **banner estilo Dukamp** (referência da imagem enviada):
  - Fundo branco com **curvas vermelhas e amarelas** nas laterais (SVG puro, sem imagem)
  - Foto do vendedor em moldura circular grande à esquerda (com anel vermelho/amarelo)
  - Badge "DESTAQUE" vermelho, nome grande, cargo em vermelho
  - Ícones de localização e telefone (telefone com `tel:` clicável)
  - Botão verde **"Falar no WhatsApp"** abrindo `https://wa.me/<numero>` em nova aba
  - Se `banner_url` estiver definido, usar como background da faixa mantendo o botão sobreposto
  - Layout responsivo: mobile empilha foto em cima, desktop lado a lado
  - SEO: title/description/og com nome do vendedor + og:image = foto

### 4. Componentes reutilizáveis
- `src/components/sellers/SellerCard.tsx` — card do grid
- `src/components/sellers/SellerProfileBanner.tsx` — banner grande com curvas SVG, foto circular, CTA WhatsApp; aceita `banner_url` opcional
- `src/components/sellers/SellerForm.tsx` — formulário admin
- `src/components/sellers/AdminSellerTable.tsx` — tabela admin com toggle ativo, editar/excluir, botões ↑/↓ para reordenar

### 5. Admin
- Nova rota `src/routes/admin.equipe-vendas.tsx` (dentro do layout admin existente)
- Item novo na sidebar admin (em `src/routes/admin.tsx`)
- CRUD completo: criar, editar, excluir, ativar/desativar, reordenar (↑/↓ atualizando `display_order`)
- Upload de foto e banner via `ImageUpload` existente (bucket `media`), com sugestão de PNG com fundo transparente para melhor encaixe
- **Remoção automática de fundo:** vou usar CSS (foto em moldura circular com `object-cover`) como fallback confiável universal. Remoção real de fundo exigiria integração com API externa paga (remove.bg) ou modelo em cliente pesado (~5MB); recomendo o admin subir PNG já sem fundo. Se quiser, posso propor a integração como próximo passo separado.

### 6. Formatação
Helper `formatWhatsappUrl(number)` que limpa o número e monta `https://wa.me/55XXXXXXXXXXX`. Helper `formatPhoneDisplay` para exibir bonito.

## Detalhes técnicos (para referência)

- Queries via TanStack Query com `supabase` client
- Loader nas rotas públicas SEM `requireSupabaseAuth` (leitura pública via policy anon)
- Página de perfil usa loader para popular `head()` com og:image do vendedor
- Curvas do banner: 2 SVGs absolutos (esquerda vermelha, direita amarela) com `pointer-events-none`
- Cores usando tokens existentes; adicionar tokens `--seller-red` e `--seller-yellow` em `src/styles.css` se necessário para o gradiente do banner

## Fora do escopo
- Remoção automática de fundo por IA (fallback = frame circular)
- Filtros/busca de vendedores (posso adicionar depois se quiser)

Confirma para eu prosseguir?
