import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface OrderStatusEmailProps {
  name: string;
  order_id: string;
  status: 'aguardando_pagamento' | 'pago' | 'em_producao' | 'entregue' | 'cancelado';
  items_count: number;
}

const statusConfig = {
  aguardando_pagamento: {
    title: 'Pagamento pendente 💳',
    preview: 'Seu pedido aguarda pagamento',
    message: 'Seu pedido foi registrado com sucesso! Para dar continuidade, realize o pagamento via PIX. Assim que confirmarmos, iniciaremos a produção dos seus backlinks.',
    color: '#d97706',
    bgColor: '#fffbeb',
    icon: '💳',
    statusLabel: 'Aguardando Pagamento',
    nextSteps: [
      'Realize o pagamento via PIX conforme as instruções enviadas',
      'Após o pagamento, envie o comprovante pelo WhatsApp',
      'Confirmaremos o pagamento em até 1 hora útil',
      'A produção será iniciada imediatamente após a confirmação',
    ],
  },
  pago: {
    title: 'Pagamento confirmado! ✅',
    preview: 'Pagamento do seu pedido foi confirmado',
    message: 'Ótima notícia! Recebemos e confirmamos o pagamento do seu pedido. Em breve iniciaremos a produção dos seus backlinks.',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    icon: '✅',
    statusLabel: 'Pago',
    nextSteps: [
      'O pagamento foi confirmado com sucesso',
      'Nossa equipe iniciará a produção em breve',
      'Você receberá um e-mail quando a produção começar',
      'Prazo estimado para início: 1-2 dias úteis',
    ],
  },
  em_producao: {
    title: 'Seu pedido está em produção! 🚀',
    preview: 'Estamos trabalhando nos seus backlinks',
    message: 'Boas notícias! Já começamos a trabalhar nos seus backlinks. Nossa equipe está produzindo seu conteúdo com todo cuidado para garantir a melhor qualidade.',
    color: '#2563eb',
    bgColor: '#eff6ff',
    icon: '⚡',
    statusLabel: 'Em Produção',
    nextSteps: [
      'Nossa equipe está criando conteúdo relevante',
      'Os backlinks serão publicados em sites de alta autoridade',
      'Você receberá um e-mail quando tudo estiver pronto',
      'Prazo estimado: 5-10 dias úteis',
    ],
  },
  entregue: {
    title: 'Pedido entregue com sucesso! 🎉',
    preview: 'Seus backlinks foram publicados',
    message: 'Parabéns! Todos os backlinks do seu pedido foram publicados com sucesso. Você pode acessar os links diretamente nos detalhes do pedido no seu painel.',
    color: '#059669',
    bgColor: '#ecfdf5',
    icon: '🎉',
    statusLabel: 'Entregue',
    nextSteps: [
      'Acesse seu painel para ver os links publicados',
      'Os backlinks podem levar algumas semanas para serem indexados pelo Google',
      'Acompanhe a evolução do seu DR/DA nas ferramentas de SEO',
      'Precisa de mais backlinks? Veja nossas opções!',
    ],
  },
  cancelado: {
    title: 'Pedido cancelado ❌',
    preview: 'Seu pedido foi cancelado',
    message: 'Informamos que seu pedido foi cancelado. Se você não solicitou o cancelamento ou tem dúvidas, entre em contato conosco.',
    color: '#dc2626',
    bgColor: '#fef2f2',
    icon: '❌',
    statusLabel: 'Cancelado',
    nextSteps: [
      'Se houver reembolso pendente, será processado em até 7 dias úteis',
      'Caso tenha sido um engano, entre em contato conosco',
      'Você pode fazer um novo pedido a qualquer momento',
    ],
  },
};

export const OrderStatusEmail = ({ name, order_id, status, items_count }: OrderStatusEmailProps) => {
  const config = statusConfig[status];
  const shortOrderId = order_id.slice(0, 8).toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>{config.preview} - Pedido #{shortOrderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="https://mkart.com.br/images/mkart-logo.png"
              width="120"
              height="40"
              alt="MK Art SEO"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>{config.title}</Heading>
          
          <Text style={text}>Olá {name || 'Cliente'},</Text>
          <Text style={text}>{config.message}</Text>

          <Section style={{ ...statusSection, backgroundColor: config.bgColor, borderColor: config.color }}>
            <Text style={statusIcon}>{config.icon}</Text>
            <Text style={{ ...statusTitle, color: config.color }}>Pedido #{shortOrderId}</Text>
            <Text style={statusLabelStyle}>
              Status: <strong style={{ color: config.color }}>{config.statusLabel}</strong>
            </Text>
            <Text style={itemsCount}>
              {items_count} {items_count === 1 ? 'backlink' : 'backlinks'}
            </Text>
          </Section>

          <Section style={infoSection}>
            <Text style={infoTitle}>
              {status === 'cancelado' ? 'Informações' : 'Próximos passos'}
            </Text>
            <Text style={infoText}>
              {config.nextSteps.map((step, i) => `• ${step}`).join('\n')}
            </Text>
          </Section>

          {status === 'entregue' && (
            <Section style={buttonSection}>
              <Link href="https://mkart.com.br/painel" style={button}>
                Ver Meus Backlinks
              </Link>
            </Section>
          )}

          {status === 'aguardando_pagamento' && (
            <Section style={buttonSection}>
              <Link href="https://mkart.com.br/painel" style={button}>
                Ver Pedido
              </Link>
            </Section>
          )}
          
          <Text style={footer}>
            Dúvidas? Estamos sempre à disposição para ajudar.
          </Text>
          
          <Text style={footer}>
            <Link href="https://mkart.com.br" style={footerLink}>MK Art SEO</Link>
            {' • '}
            <Link href="https://mkart.com.br/contato" style={footerLink}>Contato</Link>
            {' • '}
            <Link href="https://mkart.com.br/comprar-backlinks" style={footerLink}>Comprar Mais</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '560px' };
const logoSection = { textAlign: 'center' as const, marginBottom: '32px' };
const logo = { margin: '0 auto' };

const h1 = {
  color: '#333', fontSize: '24px', fontWeight: 'bold',
  lineHeight: '1.3', margin: '16px 0', textAlign: 'center' as const,
};

const text = { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '16px 0' };

const statusSection = {
  border: '2px solid', borderRadius: '12px', padding: '24px',
  margin: '24px 0', textAlign: 'center' as const,
};

const statusIcon = { fontSize: '48px', margin: '0 0 12px 0' };
const statusTitle = { fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' };
const statusLabelStyle = { color: '#666', fontSize: '16px', margin: '0 0 4px 0' };
const itemsCount = { color: '#999', fontSize: '14px', margin: '0' };

const buttonSection = { textAlign: 'center' as const, margin: '32px 0' };
const button = {
  backgroundColor: '#2563eb', borderRadius: '6px', color: '#fff',
  display: 'inline-block', fontSize: '16px', fontWeight: 'bold',
  lineHeight: '1', padding: '14px 28px', textAlign: 'center' as const, textDecoration: 'none',
};

const infoSection = {
  backgroundColor: '#f8fafc', borderRadius: '8px', padding: '20px', margin: '24px 0',
};
const infoTitle = { color: '#333', fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0' };
const infoText = { color: '#666', fontSize: '14px', lineHeight: '1.8', margin: '0', whiteSpace: 'pre-line' as const };

const footer = {
  color: '#898989', fontSize: '12px', lineHeight: '1.6',
  margin: '24px 0 0', textAlign: 'center' as const,
};
const footerLink = { color: '#898989', textDecoration: 'underline' };
