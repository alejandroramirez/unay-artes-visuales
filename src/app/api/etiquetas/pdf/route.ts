import { NextResponse } from "next/server";
import { generateLabelsPDFHTML } from "~/lib/labels-pdf-template";
import { generatePDF } from "~/lib/pdf-generator";
import { getAllArtworkForLabels } from "~/sanity/lib/queries";

/**
 * API Route: Generate Labels PDF
 * GET /api/etiquetas/pdf
 *
 * Generates a PDF document with artwork labels for printing
 * Returns PDF file for download
 */
export async function GET() {
	try {
		// Fetch all artwork data
		const artworks = await getAllArtworkForLabels();

		if (artworks.length === 0) {
			return new NextResponse("No artwork found", { status: 404 });
		}

		// Generate HTML for PDF
		const html = generateLabelsPDFHTML(artworks);

		// Generate PDF with A4 landscape and 1.5cm margins
		const pdfBuffer = await generatePDF(html, {
			format: "A4",
			landscape: true,
			margin: {
				top: "1.5cm",
				right: "1.5cm",
				bottom: "1.5cm",
				left: "1.5cm",
			},
		});

		// Create filename with current date
		const date = new Date().toISOString().split("T")[0];
		const filename = `etiquetas-unay-${date}.pdf`;

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
