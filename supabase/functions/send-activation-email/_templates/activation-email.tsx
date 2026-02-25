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

interface ActivationEmailProps {
  name: string;
  activation_url: string;
}

export const ActivationEmail = ({ name, activation_url }: ActivationEmailProps) => (
  <Html>
    <Head />
    <Preview>Ative sua conta MK Art SEO e comece a comprar backlinks de qualidade</Preview>
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
        
        <Heading style={h1}>Bem-vindo(a) à MK Art SEO!</Heading>
        
        <Text style={text}>Olá {name || 'Cliente'},</Text>
        
        <Text style={text}>
          Obrigado por se cadastrar na MK Art SEO! Para ativar sua conta e começar a comprar backlinks de alta qualidade, clique no botão abaixo.
        </Text>

        <Section style={statusSection}>
          <Text style={statusIcon}>🎉</Text>
          <Text style={statusTitle}>Conta Criada com Sucesso</Text>
          <Text style={statusLabel}>Clique abaixo para ativar sua conta</Text>
        </Section>

        <Section style={buttonSection}>
          <Link href={activation_url} style={button}>
            Ativar Minha Conta
          </Link>
        </Section>

        <Section style={infoSection}>
          <Text style={infoTitle}>Após ativar, você terá acesso a:</Text>
          <Hr style={divider} />
          <Text style={infoText}>
            {'• Marketplace com centenas de sites verificados\n• Backlinks de alta autoridade (DR 20-90+)\n• Relatórios de entrega detalhados\n• Suporte especializado em SEO'}
          </Text>
        </Section>
        
        <Text style={footer}>
          Se você não se cadastrou na MK Art SEO, pode ignorar este e-mail.
        </Text>
        
        <Text style={footer}>
          <Link href="https://mkart.com.br" style={footerLink}>MK Art SEO</Link>
          {' • '}
          <Link href="https://mkart.com.br/contato" style={footerLink}>Contato</Link>
          {' • '}
          <Link href="https://mkart.com.br/comprar-backlinks" style={footerLink}>Comprar Backlinks</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ActivationEmail;

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
  border: '2px solid #2563eb', borderRadius: '12px', padding: '24px',
  margin: '24px 0', textAlign: 'center' as const, backgroundColor: '#eff6ff',
};

const statusIcon = { fontSize: '48px', margin: '0 0 12px 0' };
const statusTitle = { fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#2563eb' };
const statusLabel = { color: '#666', fontSize: '16px', margin: '0' };

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
const divider = { borderColor: '#e2e8f0', margin: '12px 0' };
const infoText = { color: '#666', fontSize: '14px', lineHeight: '1.8', margin: '0', whiteSpace: 'pre-line' as const };

const footer = {
  color: '#898989', fontSize: '12px', lineHeight: '1.6',
  margin: '24px 0 0', textAlign: 'center' as const,
};
const footerLink = { color: '#898989', textDecoration: 'underline' };
