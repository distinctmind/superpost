import { Inter, Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata = {
  title: "Superpost",
  description: "Post straight to instagram. Eliminate friction.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className={rubik.className}>
        {children}
      </body>
    </html>
  );
}
