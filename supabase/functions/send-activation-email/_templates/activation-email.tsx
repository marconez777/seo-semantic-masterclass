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
            src="https://mkart.com.br/LOGOMK.png"
            width="120"
            height="40"
            alt="MK Art SEO"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>Bem-vindo(a) à MK Art SEO!</Heading>
        
        <Text style={text}>
          Olá {name || 'Cliente'},
        </Text>
        
        <Text style={text}>
          Obrigado por se cadastrar na MK Art SEO! Para ativar sua conta e começar a comprar backlinks de alta qualidade, clique no botão abaixo:
        </Text>
        
        <Section style={buttonSection}>
          <Link href={activation_url} style={button}>
            Ativar Minha Conta
          </Link>
        </Section>
        
        <Text style={text}>
          Após ativar sua conta, você terá acesso a:
        </Text>
        
        <Text style={list}>
          • Marketplace com centenas de sites verificados<br/>
          • Backlinks de alta autoridade (DR 20-90+)<br/>
          • Relatórios de entrega detalhados<br/>
          • Suporte especializado em SEO
        </Text>
        
        <Section style={ctaSection}>
          <Text style={text}>
            Pronto para impulsionar seu SEO?
          </Text>
          <Link href="https://mkart.com.br/comprar-backlinks" style={secondaryButton}>
            Ver Categorias de Backlinks
          </Link>
        </Section>
        
        <Text style={footer}>
          Se você não se cadastrou na MK Art SEO, pode ignorar este e-mail.
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
          <Link href="https://mkart.com.br/consultoria-seo" style={footerLink}>
            Consultoria
          </Link>
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

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '16px 0',
  paddingLeft: '16px',
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
  padding: '12px 24px',
  textAlign: 'center' as const,
  textDecoration: 'none',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
};

const secondaryButton = {
  backgroundColor: '#16a34a',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 'bold',
  lineHeight: '1',
  padding: '10px 20px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  marginTop: '12px',
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