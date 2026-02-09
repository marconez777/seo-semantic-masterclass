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
  status: 'em_producao' | 'entregue';
  items_count: number;
}

const statusConfig = {
  em_producao: {
    title: 'Seu pedido está em produção! 🚀',
    preview: 'Estamos trabalhando nos seus backlinks',
    message: 'Boas notícias! O pagamento foi confirmado e já começamos a trabalhar nos seus backlinks. Nossa equipe está produzindo seu conteúdo com todo cuidado para garantir a melhor qualidade.',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    icon: '⚡',
    statusLabel: 'Em Produção',
  },
  entregue: {
    title: 'Pedido entregue com sucesso! ✅',
    preview: 'Seus backlinks foram publicados',
    message: 'Parabéns! Todos os backlinks do seu pedido foram publicados com sucesso. Você pode acessar os links diretamente nos detalhes do pedido no seu painel.',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    icon: '🎉',
    statusLabel: 'Entregue',
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
          
          <Text style={text}>
            Olá {name || 'Cliente'},
          </Text>
          
          <Text style={text}>
            {config.message}
          </Text>

          <Section style={{ ...statusSection, backgroundColor: config.bgColor, borderColor: config.color }}>
            <Text style={{ ...statusIcon }}>{config.icon}</Text>
            <Text style={{ ...statusTitle, color: config.color }}>
              Pedido #{shortOrderId}
            </Text>
            <Text style={statusLabel}>
              Status: <strong style={{ color: config.color }}>{config.statusLabel}</strong>
            </Text>
            <Text style={itemsCount}>
              {items_count} {items_count === 1 ? 'backlink' : 'backlinks'}
            </Text>
          </Section>

          {status === 'entregue' && (
            <Section style={buttonSection}>
              <Link href="https://mkart.com.br/painel" style={button}>
                Ver Meus Backlinks
              </Link>
            </Section>
          )}

          {status === 'em_producao' && (
            <Section style={infoSection}>
              <Text style={infoTitle}>O que acontece agora?</Text>
              <Text style={infoText}>
                • Nossa equipe está criando conteúdo relevante<br/>
                • Os backlinks serão publicados em sites de alta autoridade<br/>
                • Você receberá um e-mail quando tudo estiver pronto<br/>
                • Prazo estimado: 5-10 dias úteis
              </Text>
            </Section>
          )}

          {status === 'entregue' && (
            <Section style={infoSection}>
              <Text style={infoTitle}>Próximos passos</Text>
              <Text style={infoText}>
                • Acesse seu painel para ver os links publicados<br/>
                • Os backlinks podem levar algumas semanas para serem indexados pelo Google<br/>
                • Acompanhe a evolução do seu DR/DA nas ferramentas de SEO<br/>
                • Precisa de mais backlinks? Veja nossas opções!
              </Text>
            </Section>
          )}
          
          <Text style={footer}>
            Dúvidas? Estamos sempre à disposição para ajudar.
          </Text>
          
          <Text style={footer}>
            <Link href="https://mkart.com.br" style={footerLink}>
              MK Art SEO
            </Link>
            {' • '}
            <Link href="https://mkart.com.br/contato" style={footerLink}>
              Contato
            </Link>
            {' • '}
            <Link href="https://mkart.com.br/comprar-backlinks" style={footerLink}>
              Comprar Mais
            </Link>
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

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const statusSection = {
  border: '2px solid',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const statusIcon = {
  fontSize: '48px',
  margin: '0 0 12px 0',
};

const statusTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const statusLabel = {
  color: '#666',
  fontSize: '16px',
  margin: '0 0 4px 0',
};

const itemsCount = {
  color: '#999',
  fontSize: '14px',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '1',
  padding: '14px 28px',
  textAlign: 'center' as const,
  textDecoration: 'none',
};

const infoSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '24px 0 0',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#898989',
  textDecoration: 'underline',
};
