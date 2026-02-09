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
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PaymentEmailProps {
  name: string;
  order_id: string;
  total: number;
  items_count: number;
}

export const PaymentEmail = ({ name, order_id, total, items_count }: PaymentEmailProps) => {
  const formattedTotal = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const shortOrderId = order_id.slice(0, 8).toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>PIX para pagamento do pedido #{shortOrderId} - MK Art SEO</Preview>
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
          
          <Heading style={h1}>Dados para Pagamento via PIX</Heading>
          
          <Text style={text}>
            Olá {name || 'Cliente'},
          </Text>
          
          <Text style={text}>
            Recebemos seu pedido <strong>#{shortOrderId}</strong> com {items_count} {items_count === 1 ? 'backlink' : 'backlinks'}. 
            Para finalizar, realize o pagamento via PIX conforme os dados abaixo:
          </Text>

          <Section style={pixSection}>
            <Text style={pixTitle}>Dados do PIX</Text>
            <Hr style={divider} />
            <Text style={pixData}>
              <strong>Chave PIX (CNPJ):</strong><br />
              54.128.027/0001-93
            </Text>
            <Text style={pixData}>
              <strong>Favorecido:</strong><br />
              Keila de Oliveira Castellini
            </Text>
            <Hr style={divider} />
            <Text style={totalAmount}>
              Valor Total: {formattedTotal}
            </Text>
          </Section>

          <Text style={text}>
            <strong>Importante:</strong> Após realizar o pagamento, envie o comprovante via WhatsApp para agilizar a liberação do seu pedido.
          </Text>

          <Section style={buttonSection}>
            <Link 
              href="https://wa.me/5511999999999?text=Olá! Acabei de realizar o pagamento do pedido #{shortOrderId}"
              style={button}
            >
              Enviar Comprovante via WhatsApp
            </Link>
          </Section>

          <Section style={orderDetails}>
            <Text style={detailsTitle}>Resumo do Pedido</Text>
            <Text style={detailsText}>
              • Pedido: #{shortOrderId}<br />
              • Quantidade: {items_count} {items_count === 1 ? 'backlink' : 'backlinks'}<br />
              • Valor: {formattedTotal}<br />
              • Status: Aguardando Pagamento
            </Text>
          </Section>
          
          <Text style={text}>
            Após a confirmação do pagamento, você receberá um e-mail com a atualização do status do seu pedido.
          </Text>
          
          <Text style={footer}>
            Em caso de dúvidas, entre em contato conosco.
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
            <Link href="https://mkart.com.br/painel" style={footerLink}>
              Meus Pedidos
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentEmail;

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

const pixSection = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #16a34a',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const pixTitle = {
  color: '#16a34a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#16a34a',
  margin: '16px 0',
};

const pixData = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '12px 0',
  textAlign: 'center' as const,
};

const totalAmount = {
  color: '#16a34a',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#25D366',
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

const orderDetails = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const detailsTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const detailsText = {
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
