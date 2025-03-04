import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BizContently - AI-Powered Content Creation",
  description:
    "Transform your content strategy with BizContently. AI-powered content creation and distribution platform for bloggers, marketers, and creators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
