import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";

const publicSans = Public_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Jira Clone",
    description: "A Jira clone built with Next.js and Hono",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={publicSans.className}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
