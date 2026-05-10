import type { Metadata } from "next";
import {
  Anton,
  Archivo,
  Caveat,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { TweaksProvider } from "@/context/TweaksContext";
import PromoBar from "@/components/layout/PromoBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/ui/Toast";
import TweaksPanel from "@/components/ui/tweaks/TweaksPanel";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["600", "700"],
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PPI Jerman — Merch Drop",
  description:
    "Official merchandise dari Perhimpunan Pelajar Indonesia di Jerman.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${anton.variable} ${archivo.variable} ${caveat.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <CartProvider>
          <ToastProvider>
            <TweaksProvider>
              <div
                style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}
              >
                <PromoBar />
                <Navbar />
                <main>{children}</main>
                <Footer />
              </div>
              <Toast />
              <TweaksPanel />
            </TweaksProvider>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
