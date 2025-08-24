# Documentação do Fluxo do Modal "Comprar"

Este documento detalha o funcionamento do modal que é acionado quando um usuário clica no botão "Comprar" na página de listagem de backlinks.

## Visão Geral

O fluxo não é um processo de compra direto, mas sim um mecanismo para iniciar um contato comercial via WhatsApp. O usuário seleciona um backlink, preenche informações adicionais e é redirecionado para o WhatsApp com uma mensagem pré-preenchida para solicitar um orçamento ou finalizar a compra.

## Componentes Envolvidos

O fluxo é composto por três componentes principais:

1.  `src/pages/ComprarBacklinks.tsx`: A página principal que exibe a lista de backlinks.
2.  `src/components/marketplace/BacklinkTableRow.tsx`: O componente de linha da tabela que contém o botão "Comprar".
3.  `src/components/ui/ContactModal.tsx`: O componente do modal que coleta as informações do usuário.

## Detalhamento do Fluxo

### 1. Acionando o Modal

- **Página**: `src/pages/ComprarBacklinks.tsx`
- **Ação**: O usuário está na página `/comprar-backlinks`, que exibe uma tabela de backlinks disponíveis.

A página `ComprarBacklinks.tsx` busca os dados dos backlinks e os renderiza em uma tabela. Para cada backlink, ela passa uma função `onBuy` para o componente `BacklinkTableRow`.

```tsx
// Em src/pages/ComprarBacklinks.tsx

const [open, setOpen] = useState(false);
const [selected, setSelected] = useState<{ id: string; name: string; price_cents: number } | null>(null);

const onBuy = (b: any) => {
  setSelected({ id: b.id, name: b.site_name ?? b.site_url ?? 'Backlink', price_cents: b.price_cents });
  setOpen(true);
};

// ... no JSX
<BacklinkTableRow key={b.id} item={b} onBuy={onBuy} />
```

### 2. O Clique no Botão "Comprar"

- **Componente**: `src/components/marketplace/BacklinkTableRow.tsx`
- **Ação**: O usuário clica no botão "Comprar" em uma das linhas da tabela.

O componente `BacklinkTableRow` contém o botão que, ao ser clicado, executa a função `onBuy` recebida via props, passando os dados do item daquela linha.

```tsx
// Em src/components/marketplace/BacklinkTableRow.tsx

export default function BacklinkTableRow({ item, onBuy }: { item: BacklinkItem; onBuy: (b: BacklinkItem) => void }) {
  // ...
  return (
    // ...
    <Button size="sm" onClick={() => onBuy(item)}>Comprar</Button>
    // ...
  );
}
```

Ao ser chamada, a função `onBuy` na página `ComprarBacklinks.tsx` atualiza dois estados:
1.  `selected`: Armazena os dados do backlink selecionado (ID, nome, preço).
2.  `open`: É definido como `true`.

A mudança no estado `open` faz com que o `ContactModal` seja renderizado e exibido.

```tsx
// Em src/pages/ComprarBacklinks.tsx

{selected && (
  <ContactModal open={open} onOpenChange={setOpen} product={selected} />
)}
```

### 3. Interação com o Modal

- **Componente**: `src/components/ui/ContactModal.tsx`
- **Ação**: O usuário preenche os campos no modal e clica em "Contatar WhatsApp".

O `ContactModal` é uma caixa de diálogo (`Dialog`) que contém um formulário com dois campos:
- **URL de destino**: O site para o qual o backlink deve apontar (obrigatório).
- **Texto âncora**: O texto que será usado para o link (opcional).

```tsx
// Em src/components/ui/ContactModal.tsx

const ContactModal = ({ open, onOpenChange, product }: ContactModalProps) => {
  const [urlDestino, setUrlDestino] = useState("");
  const [textoAncora, setTextoAncora] = useState("");
  // ...
```

### 4. Redirecionamento para o WhatsApp

- **Componente**: `src/components/ui/ContactModal.tsx`
- **Ação**: O clique no botão "Contatar WhatsApp" aciona a função `handleContact`.

A função `handleContact` constrói uma mensagem personalizada com os detalhes do produto e os dados inseridos pelo usuário. Em seguida, ela codifica essa mensagem e a utiliza para montar uma URL do WhatsApp (`wa.me`).

O número de telefone para o contato está fixo no código (`5511999999999`).

Finalmente, o `window.open` é usado para abrir o link do WhatsApp em uma nova aba, e o modal é fechado.

```tsx
// Em src/components/ui/ContactModal.tsx

const handleContact = () => {
  const message = `Olá! Tenho interesse no backlink "${product?.name}" no valor de R$ ${((product?.price_cents || 0) / 100).toFixed(2).replace('.', ',')}.

Detalhes:
- URL de destino: ${urlDestino}
- Texto âncora: ${textoAncora}

Gostaria de mais informações sobre como proceder com a compra.`;

  const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  onOpenChange(false);
};

// ... no JSX
<Button
  onClick={handleContact}
  disabled={!urlDestino}
  className="gap-2"
>
  <ExternalLink size={16} />
  Contatar WhatsApp
</Button>
```

## Conclusão

O sistema de "compra" é, na verdade, um funil de contato otimizado. Ele captura o interesse do usuário em um item específico e facilita o início de uma conversa no WhatsApp com todos os detalhes necessários já preenchidos, agilizando o processo de negociação para a equipe de vendas.
