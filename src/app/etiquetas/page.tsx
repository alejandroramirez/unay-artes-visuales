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

			{/* Labels grid - 4 per page (2x2) */}
			<div className="container mx-auto px-4">
				{Array.from({ length: Math.ceil(artworks.length / 4) }).map(
					(_, pageIndex) => {
						const startIndex = pageIndex * 4;
						const pageArtworks = artworks.slice(startIndex, startIndex + 4);

						return (
							<div
								key={pageIndex}
								className={
									pageIndex < Math.ceil(artworks.length / 4) - 1
										? "page-break"
										: ""
								}
							>
								<div className="labels-grid">
									{pageArtworks.map((artwork) => (
										<div key={artwork._id} className="label">
											<h2 className="label-title">{artwork.title}</h2>

											<div className="label-divider" />

											{artwork.autor && (
												<p className="label-field">
													<span className="label-field-name">Autor:</span>{" "}
													{artwork.autor}
												</p>
											)}

											{artwork.year && (
												<p className="label-field">
													<span className="label-field-name">Año:</span>{" "}
													{artwork.year}
												</p>
											)}

											{artwork.medium && (
												<p className="label-field">
													<span className="label-field-name">Técnica:</span>{" "}
													{artwork.medium}
												</p>
											)}

											{artwork.dimensions && (
												<p className="label-field">
													<span className="label-field-name">Dimensiones:</span>{" "}
													{artwork.dimensions}
												</p>
											)}

											{artwork.category && (
												<p className="label-field">
													<span className="label-field-name">Categoría:</span>{" "}
													{artwork.category.title}
												</p>
											)}
										</div>
									))}

									{/* Fill empty slots in the last page */}
									{pageArtworks.length < 4 &&
										Array.from({ length: 4 - pageArtworks.length }).map(
											(_, emptyIndex) => (
												<div
													key={`empty-${emptyIndex}`}
													className="label"
													style={{ visibility: "hidden" }}
												/>
											),
										)}
								</div>
							</div>
						);
					},
				)}
			</div>
		</main>
	);
}
