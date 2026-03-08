import "./globals.css";
import type { ReactNode } from "react";
import Providers from "../components/Providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "FreeAgentsLTD",
  description: "Sector based esports platform for finding teams and players",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
