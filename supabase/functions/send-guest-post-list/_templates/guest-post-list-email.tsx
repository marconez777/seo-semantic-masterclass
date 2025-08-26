import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface GuestPostListEmailProps {
  listUrl: string;
}

export const GuestPostListEmail = ({
  listUrl,
}: GuestPostListEmailProps) => (
  <Html>
    <Head />
    <Preview>Sua lista de 30 sites para Guest Post DR 20-90 está aqui!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>🎉 Parabéns!</Heading>
          <Text style={text}>
            Você deu o primeiro passo para construir uma estratégia sólida de backlinks!
          </Text>
        </Section>

        <Section style={content}>
          <Text style={text}>
            Como prometido, aqui está sua <strong>lista exclusiva com 30 sites para Guest Post</strong> 
            com Domain Rating entre 20 e 90 - totalmente GRÁTIS!
          </Text>
          
          <Text style={text}>
            Esta lista foi cuidadosamente selecionada pela nossa equipe e contém sites de alta qualidade 
            que aceitam guest posts, ajudando você a:
          </Text>

          <ul style={list}>
            <li>Construir backlinks de qualidade</li>
            <li>Aumentar a autoridade do seu site</li>
            <li>Melhorar seu posicionamento no Google</li>
            <li>Expandir seu alcance para novos públicos</li>
          </ul>

          <Section style={buttonContainer}>
            <Button style={button} href={listUrl}>
              🚀 ACESSAR MINHA LISTA AGORA
            </Button>
          </Section>

          <Text style={text}>
            <strong>Dica profissional:</strong> Para maximizar seus resultados, foque primeiro nos sites 
            com DR mais próximo ao seu atual. Isso aumenta suas chances de aprovação!
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Precisa de ajuda para criar uma estratégia completa de SEO?<br />
            <Link href="https://mkart.com.br/consultoria-seo" style={footerLink}>
              Conheça nossa consultoria especializada
            </Link>
          </Text>
          
          <Text style={footerText}>
            Com carinho,<br />
            <strong>Equipe MK Art SEO</strong>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default GuestPostListEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#7c3aed',
  color: '#ffffff',
}

const content = {
  padding: '32px 24px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
  paddingLeft: '20px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  margin: '0 auto',
}

const footer = {
  borderTop: '1px solid #eaeaea',
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
}

const footerLink = {
  color: '#7c3aed',
  textDecoration: 'underline',
}