import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Envago",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "64px 24px 96px", fontFamily: "inherit", color: "#1a1a1a", lineHeight: 1.75 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Política de Privacidade</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 48 }}>Última atualização: 1 de julho de 2026</p>

      <p>A Envago (&quot;nós&quot;, &quot;nosso&quot;) opera o site <strong>envago.live</strong> e se compromete a proteger a privacidade dos seus usuários. Esta política descreve quais dados coletamos, como os utilizamos e como os protegemos.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>1. Dados que coletamos</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>Dados de contato:</strong> nome, endereço de e-mail e número de WhatsApp fornecidos ao fazer uma reserva ou se cadastrar como operador.</li>
        <li><strong>Dados de pagamento:</strong> processados com segurança pela Stripe. Não armazenamos dados de cartão de crédito.</li>
        <li><strong>Dados de uso:</strong> páginas visitadas, buscas realizadas e interações com o site, coletados de forma anônima.</li>
        <li><strong>Comunicações:</strong> mensagens trocadas com a Lara (nossa assistente de IA) via WhatsApp ou painel.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>2. Como usamos seus dados</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>Processar e confirmar reservas de passeios.</li>
        <li>Comunicar atualizações de reserva por e-mail ou WhatsApp.</li>
        <li>Melhorar a experiência na plataforma.</li>
        <li>Cumprir obrigações legais e prevenir fraudes.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>3. Compartilhamento de dados</h2>
      <p>Não vendemos seus dados. Compartilhamos informações apenas com:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>Operadores de passeio:</strong> nome e contato do turista para confirmar a reserva.</li>
        <li><strong>Stripe:</strong> processamento de pagamentos.</li>
        <li><strong>Resend / AWS:</strong> envio de e-mails transacionais.</li>
        <li><strong>Anthropic:</strong> processamento das mensagens pela IA Lara.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>4. Segurança</h2>
      <p>Utilizamos criptografia em trânsito (HTTPS) e em repouso. O acesso aos dados é restrito a sistemas e pessoas autorizadas.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>5. Seus direitos</h2>
      <p>Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento entrando em contato conosco.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>6. Cookies</h2>
      <p>Usamos cookies essenciais para o funcionamento do site. Não utilizamos cookies de rastreamento de terceiros para publicidade.</p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 40, marginBottom: 12 }}>7. Contato</h2>
      <p>Para dúvidas sobre esta política ou para exercer seus direitos, entre em contato:<br />
        <a href="mailto:info@seif.rocks" style={{ color: "#FF2924" }}>info@seif.rocks</a><br />
        Ireland
      </p>
    </div>
  );
}
