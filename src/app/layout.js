import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CaseStudyProvider } from "@/context/case-study-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ERPNext Case Study Generator",
  description:
    "Generate test case studies for ERPNext warehouse implementation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CaseStudyProvider>{children}</CaseStudyProvider>
      </body>
    </html>
  );
}
