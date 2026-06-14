import {
  Body, Container, Head, Hr, Html, Link, Section, Text, Font,
} from "@react-email/components";
import { CSSProperties, ReactNode } from "react";

const colors = {
  bg: "#efeae0",
  card: "#ffffff",
  ink: "#1f1f1f",
  muted: "#8a8579",
  accent: "#3d5a80",
  accentDeep: "#2e4a6e",
  border: "#ddd8cc",
  danger: "#b91c1c",
};

const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function EmailLayout({ children, preview }: { children: ReactNode; preview?: string }) {
  return (
    <Html lang="en">
      <Head>
        {preview && <meta name="description" content={preview} />}
        <Font
          fontFamily="Anton"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm0K08i4gS7lu.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={{ backgroundColor: colors.bg, fontFamily: font, margin: 0, padding: "40px 16px" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto 0 auto" }}>
          <Section style={{ textAlign: "center", paddingBottom: "20px" }}>
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "0 auto 10px" }}>
              <tbody>
                <tr>
                  <td>
                    <table role="presentation" cellPadding={0} cellSpacing={0} style={{
                      width: 36, height: 36,
                      borderRadius: "50%",
                      border: `2.5px solid ${colors.ink}`,
                    }}>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                            <div style={{
                              width: 12, height: 12,
                              borderRadius: "50%",
                              backgroundColor: colors.ink,
                              display: "inline-block",
                            }} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ paddingLeft: 10, verticalAlign: "middle", lineHeight: 1 }}>
                    <div style={{ fontFamily: "Anton, Arial, sans-serif", fontSize: 20, fontWeight: 'bold', color: colors.ink, letterSpacing: "0.04em", lineHeight: 1 }}>PPI</div>
                    <div style={{ fontFamily: "Anton, Arial, sans-serif", fontSize: 20, fontWeight: 'bold', color: colors.accent, letterSpacing: "0.04em", lineHeight: 1 }}>JERMAN</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Card */}
          <Section style={{
            backgroundColor: colors.card,
            borderRadius: "8px",
            padding: "36px 40px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ textAlign: "center", padding: "24px 0 8px" }}>
            <Text style={{ fontFamily: font, fontSize: "12px", color: colors.muted, margin: "0 0 4px" }}>
              PPI Jerman &mdash; <Link href="https://ppij-shop.de" style={{ color: colors.muted }}>ppij-shop.de</Link>
            </Text>
            <Text style={{ fontFamily: font, fontSize: "12px", color: colors.muted, margin: 0 }}>
              &copy; {new Date().getFullYear()} PPI Jerman. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <Text style={{
      fontFamily: font,
      fontSize: "22px",
      fontWeight: "700",
      color: danger ? colors.danger : colors.ink,
      margin: "0 0 16px",
      lineHeight: "1.3",
    }}>
      {children}
    </Text>
  );
}

export function EmailText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <Text style={{
      fontFamily: font,
      fontSize: "15px",
      color: colors.ink,
      lineHeight: "1.6",
      margin: "0 0 12px",
      ...style,
    }}>
      {children}
    </Text>
  );
}

export function EmailMuted({ children }: { children: ReactNode }) {
  return (
    <Text style={{
      fontFamily: font,
      fontSize: "13px",
      color: colors.muted,
      lineHeight: "1.5",
      margin: "0 0 8px",
    }}>
      {children}
    </Text>
  );
}

export function EmailButton({ href, children, danger }: { href: string; children: ReactNode; danger?: boolean }) {
  return (
    <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: danger ? colors.danger : colors.accent,
          color: "#ffffff",
          fontFamily: font,
          fontSize: "15px",
          fontWeight: "600",
          textDecoration: "none",
          borderRadius: "6px",
          padding: "14px 28px",
          lineHeight: "1",
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

export function EmailDivider() {
  return <Hr style={{ borderColor: colors.border, margin: "20px 0" }} />;
}

export function OrderItemsTable({ items, itemsTotal, shippingCost, total }: {
  items: { name: string; quantity: number; price: string }[];
  itemsTotal: string;
  shippingCost: string;
  total: string;
}) {
  const rowStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: `1px solid ${colors.border}`,
  };
  const labelStyle: CSSProperties = { fontFamily: font, fontSize: "14px", color: colors.ink };
  const valueStyle: CSSProperties = { fontFamily: font, fontSize: "14px", color: colors.ink };
  const totalLabelStyle: CSSProperties = { fontFamily: font, fontSize: "15px", fontWeight: "700", color: colors.ink };
  const totalValueStyle: CSSProperties = { fontFamily: font, fontSize: "15px", fontWeight: "700", color: colors.accent };

  return (
    <Section style={{ backgroundColor: "#f8f6f1", borderRadius: "6px", padding: "16px 20px", margin: "16px 0" }}>
      {items.map((item) => (
        <Section key={item.name} style={rowStyle}>
          <Text style={{ ...labelStyle, margin: 0 }}>{item.name} &times; {item.quantity}</Text>
          <Text style={{ ...valueStyle, margin: 0 }}>{item.price}</Text>
        </Section>
      ))}
      <Section style={{ ...rowStyle, borderBottom: "none", paddingTop: "10px" }}>
        <Text style={{ ...labelStyle, margin: 0 }}>Subtotal</Text>
        <Text style={{ ...valueStyle, margin: 0 }}>{itemsTotal}</Text>
      </Section>
      <Section style={{ ...rowStyle, borderBottom: "none" }}>
        <Text style={{ ...labelStyle, margin: 0 }}>Shipping</Text>
        <Text style={{ ...valueStyle, margin: 0 }}>{shippingCost}</Text>
      </Section>
      <Section style={{ paddingTop: "8px", borderTop: `2px solid ${colors.border}`, marginTop: "4px" }}>
        <Section style={{ display: "flex", justifyContent: "space-between" }}>
          <Text style={{ ...totalLabelStyle, margin: 0 }}>Total</Text>
          <Text style={{ ...totalValueStyle, margin: 0 }}>{total}</Text>
        </Section>
      </Section>
    </Section>
  );
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <Section style={{
      backgroundColor: "#f8f6f1",
      border: `1px solid ${colors.border}`,
      borderRadius: "6px",
      padding: "16px 20px",
      margin: "16px 0",
    }}>
      {children}
    </Section>
  );
}
