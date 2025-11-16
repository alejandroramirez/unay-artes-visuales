import "~/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
	title: "Universidad de las Artes de Yucatán - Grupo Primero A",
	description: "Portafolio de arte visual - Grupo Primero A",
};

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["400", "500", "600"],
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="es-MX" className={`${inter.variable}`}>
			<body>{children}</body>
		</html>
	);
}
