# Player de vídeo "obrigatório" no /webinar-medico

## Objetivo
Substituir o iframe do YouTube no hero da página `/webinar-medico` por um player customizado que:
- Mostra controles de **play/pause** e **volume/mute**
- Mostra uma **barra de progresso visual** que **não pode ser arrastada/clicada para pular**
- Não permite que o usuário avance o vídeo (forçando assistir até o final)
- Permite **retroceder** é opcional — por padrão também bloqueado, para evitar burlar via "voltar e adiantar"

## Por que não usar YouTube
O player do YouTube (mesmo com `controls=0`, `disablekb=1`) ainda permite seek por teclado, clique na timeline ou pelo menu de contexto. Não é confiável para travar progresso. A solução robusta é hospedar o arquivo `.mp4` e usar a tag `<video>` nativa do HTML5 com controles customizados em React — assim temos controle total do que o usuário pode ou não fazer.

## Hospedagem do vídeo
Você pode hospedar o `.mp4` em qualquer um destes (sem custo extra para você):
- **Lovable Cloud Storage** (bucket público) — recomendado, integrado ao projeto
- **Cloudflare R2 / Bunny.net / AWS S3** — se já usa
- **Servidor próprio** com CORS liberado

Vou assumir Lovable Cloud Storage por padrão (criando um bucket público `webinar-videos`). Se preferir outro, é só trocar a URL.

## O que vai ser feito

### 1. Criar bucket de vídeos (Lovable Cloud)
- Criar bucket público `webinar-videos` via migration
- Você fará upload do `.mp4` pela aba de Storage do backend (te passo o passo a passo no chat)

### 2. Novo componente `LockedVideoPlayer.tsx`
Em `src/components/webinar/LockedVideoPlayer.tsx`:
- Usa `<video>` HTML5 com `ref`, **sem** o atributo `controls` nativo
- Atributos `controlsList="nodownload noremoteplayback"`, `disablePictureInPicture`, e `onContextMenu` desativado (impede "salvar vídeo como" e menu de contexto)
- Controles customizados (overlay no rodapé do vídeo):
  - Botão **Play/Pause** (ícones `Play`/`Pause` do lucide-react)
  - Botão **Mute/Unmute** + slider de volume (0–100)
  - **Barra de progresso visual** (`<div>` com largura proporcional a `currentTime/duration`) — **não interativa**, sem `onClick` nem `<input type="range">`
  - Tempo decorrido / duração total (ex: `12:34 / 40:00`)
- Bloqueio anti-seek:
  - Listener `onSeeking`/`onSeeked` que, se `video.currentTime > maxWatchedTime + 0.5`, força `video.currentTime = maxWatchedTime`
  - `maxWatchedTime` é atualizado em `onTimeUpdate` apenas durante reprodução normal
  - Isso impede também tentativas via teclado (setas, J/L) ou DevTools básicas
- Estilo seguindo o design system do webinar (cores `webinar-*`, bordas e sombra como o iframe atual)

### 3. Integrar no Hero
Em `src/components/webinar/WebinarHero.tsx`:
- Substituir o bloco `<iframe>` (linhas ~25-32) pelo `<LockedVideoPlayer src={videoUrl} poster={posterUrl} />`
- Trocar a prop `videoId` por `videoUrl` (e opcional `posterUrl` para a thumbnail)

### 4. Configuração na página
Em `src/pages/WebinarMedico.tsx`:
- Substituir `HERO_VIDEO_ID` por `HERO_VIDEO_URL` apontando para o arquivo no bucket (ex: `https://<projeto>.supabase.co/storage/v1/object/public/webinar-videos/hero.mp4`)
- Adicionar `HERO_POSTER_URL` opcional (imagem de capa)

### 5. Observações importantes (vou avisar no chat após implementar)
- **Nenhum bloqueio client-side é 100%** contra um usuário muito técnico (DevTools pode pausar JS). Mas elimina 99% dos casos: clique na timeline, atalhos de teclado, menu de contexto, download direto.
- Para máximo controle, no futuro dá para usar HLS com tokens assinados — mas é overkill para webinar de captação.
- Recomendo manter o vídeo **com áudio começando mutado** + botão grande de "Ativar som" no overlay inicial — ajuda autoplay funcionar em mobile.

## Arquivos afetados
- **Novo:** `src/components/webinar/LockedVideoPlayer.tsx`
- **Editado:** `src/components/webinar/WebinarHero.tsx` (troca iframe pelo novo player + prop)
- **Editado:** `src/pages/WebinarMedico.tsx` (troca constante `HERO_VIDEO_ID` por `HERO_VIDEO_URL`)
- **Migration:** criar bucket público `webinar-videos` no Lovable Cloud
