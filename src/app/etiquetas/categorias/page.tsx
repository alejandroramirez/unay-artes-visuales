import type { Metadata } from "next";
import { getAllCategories } from "~/sanity/lib/queries";
import { PrintButton } from "../PrintButton";
import "../print.css";

export const metadata: Metadata = {
	title: "Catálogo QR Categorías | Universidad de las Artes de Yucatán",
	description: "Catálogo de categorías con códigos QR",
};

/**
 * Category QR Code Catalog Page
 * Displays QR codes for:
 * - Website homepage
 * - Each category page
 */
export default async function CategoryQRCatalogPage() {
	const categories = await getAllCategories();

	// Add 1 for the website homepage QR code
	const totalQRCodes = categories.length + 1;

	return (
		<main className="print-container">
			{/* Screen-only header with download button */}
			<div className="print-header no-print">
				<div className="container mx-auto px-4">
					<h1
						className="mb-3 font-semibold text-2xl"
						style={{ color: "#1a1a1a" }}
					>
						Catálogo QR - Categorías
					</h1>
					<p className="mb-4 text-sm" style={{ color: "#666" }}>
						{totalQRCodes} códigos QR (1 sitio web + {categories.length}{" "}
						{categories.length === 1 ? "categoría" : "categorías"}) • 8 por
						página
					</p>
					<PrintButton apiPath="/api/etiquetas/categorias/pdf" />
				</div>
			</div>

			{/* Preview message - this page just triggers PDF download */}
			<div className="container mx-auto px-4 py-12">
				<div className="mx-auto max-w-2xl text-center">
					<div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
						<h2 className="mb-4 font-semibold text-gray-900 text-xl">
							Catálogo de Códigos QR para Categorías
						</h2>
						<p className="mb-6 text-gray-600">
							Este catálogo contiene códigos QR para:
						</p>
						<ul className="mb-6 space-y-2 text-left text-gray-700">
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>
									<strong>Sitio Web Principal:</strong> Enlace al homepage
								</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>
									<strong>{categories.length} Categorías:</strong> Enlaces a
									cada página de categoría
								</span>
							</li>
						</ul>
						<p className="text-gray-600 text-sm">
							Haz clic en "Descargar Catálogo QR" para generar el PDF.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
