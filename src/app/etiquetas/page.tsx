import type { Metadata } from "next";
import { getAllArtworkForLabels } from "~/sanity/lib/queries";
import { PrintButton } from "./PrintButton";
import "./print.css";

export const metadata: Metadata = {
	title: "Catálogo QR | Universidad de las Artes de Yucatán",
	description: "Catálogo de obras con códigos QR",
};

/**
 * QR Code Catalog Page
 * Displays QR code contact sheet for all artworks
 * Generates PDF with 8 QR codes per A4 portrait page
 */
export default async function QRCatalogPage() {
	const artworks = await getAllArtworkForLabels();

	return (
		<main className="print-container">
			{/* Screen-only header with download button */}
			<div className="print-header no-print">
				<div className="container mx-auto px-4">
					<h1
						className="mb-3 font-semibold text-2xl"
						style={{ color: "#1a1a1a" }}
					>
						Catálogo de Códigos QR
					</h1>
					<p className="mb-4 text-sm" style={{ color: "#666" }}>
						{artworks.length} {artworks.length === 1 ? "obra" : "obras"} • 8
						códigos QR por página
					</p>
					<PrintButton />
				</div>
			</div>

			{/* Preview message - this page just triggers PDF download */}
			<div className="container mx-auto px-4 py-12">
				<div className="mx-auto max-w-2xl text-center">
					<div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
						<h2 className="mb-4 font-semibold text-gray-900 text-xl">
							Catálogo de Códigos QR para Obras
						</h2>
						<p className="mb-6 text-gray-600">
							Este catálogo contiene códigos QR para todas las obras de arte.
						</p>
						<p className="text-gray-600 text-sm">
							Haz clic en "Descargar Catálogo QR" para generar el PDF.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
