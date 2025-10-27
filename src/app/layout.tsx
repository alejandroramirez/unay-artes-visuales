import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
	title: "UNAY Artes Visuales",
	description: "Portafolio de arte visual",
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="es-MX" className={`${geist.variable}`}>
			<body>{children}</body>
		</html>
	);
}
