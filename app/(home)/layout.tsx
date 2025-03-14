import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

// Load Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Maps & Memories | Custom Map Frames",
  description: "Turn your special places into lasting memories with our custom map frames.",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`flex flex-col min-h-screen ${montserrat.variable} font-sans`}>
      <Header />
      <main className="flex-1 bg-[#F7F5F6]">{children}</main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
} 