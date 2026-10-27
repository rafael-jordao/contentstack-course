import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const fontSerif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = [
  fontSans.variable,
  fontSerif.variable,
  fontMono.variable,
].join(" ");
