import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { generatePDF } from "~/lib/pdf-generator";
import { generateQRContactSheetHTML } from "~/lib/qr-contact-sheet-template";
import { getAllArtworkForLabels } from "~/sanity/lib/queries";

/**
 * API Route: Generate QR Code Contact Sheet PDF
 * GET /api/etiquetas/pdf
 *
 * Generates a PDF document with QR codes for each artwork
 * Returns PDF file for download
 */
export async function GET(request: Request) {
	try {
		// Fetch all artwork data
		const artworks = await getAllArtworkForLabels();

		if (artworks.length === 0) {
			return new NextResponse("No artwork found", { status: 404 });
		}

		// Get base URL from request
		const url = new URL(request.url);
		const baseUrl = `${url.protocol}//${url.host}`;

		// Generate QR codes for each artwork
		const qrCodeData = await Promise.all(
			artworks.map(async (artwork) => {
				const artworkUrl = `${baseUrl}/obra/${artwork.slug.current}`;
				const qrCodeDataUrl = await QRCode.toDataURL(artworkUrl, {
					width: 300,
					margin: 1,
					color: {
						dark: "#000000",
						light: "#FFFFFF",
					},
				});

				return {
					artwork,
					qrCodeDataUrl,
					url: artworkUrl,
				};
			}),
		);

		// Generate HTML for PDF
		const html = generateQRContactSheetHTML(qrCodeData);

		// Generate PDF with A4 portrait and 1.5cm margins
		const pdfBuffer = await generatePDF(html, {
			format: "A4",
			landscape: false,
			margin: {
				top: "1.5cm",
				right: "1.5cm",
				bottom: "1.5cm",
				left: "1.5cm",
			},
		});

		// Create filename with current date
		const date = new Date().toISOString().split("T")[0];
		const filename = `catalogo-qr-unay-${date}.pdf`;

		// Return PDF as downloadable file
		return new NextResponse(new Uint8Array(pdfBuffer), {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${filename}"`,
				"Content-Length": pdfBuffer.length.toString(),
			},
		});
	} catch (error) {
		console.error("Error generating PDF:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return new NextResponse(`Error generating PDF: ${errorMessage}`, {
			status: 500,
		});
	}
}
