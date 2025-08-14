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

interface ResetPasswordEmailProps {
  reset_url: string;
}

export const ResetPasswordEmail = ({ reset_url }: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefinir senha da sua conta MK Art SEO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://mkart.com.br/LOGOMK.png"
            width="120"
            height="40"
            alt="MK Art SEO"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>Redefinir sua senha</Heading>
        
        <Text style={text}>
          Você solicitou a redefinição da sua senha da MK Art SEO.
        </Text>
        
        <Text style={text}>
          Clique no botão abaixo para criar uma nova senha:
        </Text>
        
        <Section style={buttonSection}>
          <Link href={reset_url} style={button}>
            Redefinir Minha Senha
          </Link>
        </Section>
        
        <Text style={warningText}>
          ⚠️ Este link é válido por 1 hora e pode ser usado apenas uma vez.
        </Text>
        
        <Text style={text}>
          Se você não solicitou esta redefinição, pode ignorar este e-mail. Sua senha permanecerá inalterada.
        </Text>
        
        <Section style={helpSection}>
          <Text style={text}>
            <strong>Precisa de ajuda?</strong>
          </Text>
          <Text style={text}>
            Entre em contato conosco pelo e-mail contato@mkart.com.br ou pelo WhatsApp (11) 99999-9999.
          </Text>
        </Section>
        
        <Text style={footer}>
          <Link href="https://mkart.com.br" style={footerLink}>
            MK Art SEO
          </Link>
          {' • '}
          <Link href="https://mkart.com.br/contato" style={footerLink}>
            Contato
          </Link>
          {' • '}
          <Link href="https://mkart.com.br/consultoria-seo" style={footerLink}>
            Consultoria
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

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

const warningText = {
  color: '#dc2626',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderRadius: '6px',
  border: '1px solid #fecaca',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '1',
  padding: '12px 24px',
  textAlign: 'center' as const,
  textDecoration: 'none',
};

const helpSection = {
  margin: '32px 0',
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
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