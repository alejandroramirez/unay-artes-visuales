import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { generateCategoryQRSheetHTML } from "~/lib/category-qr-template";
import { generatePDF } from "~/lib/pdf-generator";
import { getAllCategories } from "~/sanity/lib/queries";

/**
 * API Route: Generate Category QR Code Contact Sheet PDF
 * GET /api/etiquetas/categorias/pdf
 *
 * Generates a PDF document with QR codes for:
 * - Website homepage
 * - Each category page
 * Returns PDF file for download
 */
export async function GET(request: Request) {
	try {
		// Fetch all categories
		const categories = await getAllCategories();

		// Get base URL from request
		const url = new URL(request.url);
		const baseUrl = `${url.protocol}//${url.host}`;

		// Generate QR code for website homepage
		const websiteQRCodeDataUrl = await QRCode.toDataURL(baseUrl, {
			width: 300,
			margin: 1,
			color: {
				dark: "#000000",
				light: "#FFFFFF",
			},
		});

		const websiteQR = {
			title: "Universidad de las Artes de Yucatán",
			qrCodeDataUrl: websiteQRCodeDataUrl,
			url: baseUrl,
		};

		// Generate QR codes for each category
		const categoryQRs = await Promise.all(
			categories.map(async (category) => {
				const categoryUrl = `${baseUrl}/categoria/${category.slug.current}`;
				const qrCodeDataUrl = await QRCode.toDataURL(categoryUrl, {
					width: 300,
					margin: 1,
					color: {
						dark: "#000000",
						light: "#FFFFFF",
					},
				});

				return {
					category,
					qrCodeDataUrl,
					url: categoryUrl,
				};
			}),
		);

		// Generate HTML for PDF
		const html = generateCategoryQRSheetHTML(websiteQR, categoryQRs);

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
		const filename = `catalogo-qr-categorias-unay-${date}.pdf`;

		// Return PDF as downloadable file
		return new NextResponse(new Uint8Array(pdfBuffer), {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${filename}"`,
				"Content-Length": pdfBuffer.length.toString(),
			},
		});
	} catch (error) {
		console.error("Error generating category QR PDF:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return new NextResponse(`Error generating PDF: ${errorMessage}`, {
			status: 500,
		});
	}
}
