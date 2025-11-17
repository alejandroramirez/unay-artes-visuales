import type { Artwork } from "~/sanity/types";

interface QRCodeData {
	artwork: Omit<Artwork, "description">;
	qrCodeDataUrl: string;
	url: string;
}

/**
 * Generate HTML for QR code contact sheet PDF
 * Creates a print-ready document with 8 QR codes per A4 portrait page
 */
export function generateQRContactSheetHTML(qrCodeData: QRCodeData[]): string {
	// Helper function to safely escape HTML
	const escapeHTML = (str: string | undefined): string => {
		if (!str) return "";
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};

	// Generate QR code cell HTML
	const generateQRCell = (data: QRCodeData): string => `
    <div class="qr-cell">
      <img src="${data.qrCodeDataUrl}" alt="QR Code for ${escapeHTML(data.artwork.title)}" class="qr-image" />
      <p class="artwork-title">${escapeHTML(data.artwork.title)}</p>
      ${data.artwork.autor ? `<p class="artwork-author">${escapeHTML(data.artwork.autor)}</p>` : ""}
    </div>
  `;

	// Generate empty cell for grid filling
	const generateEmptyCell = (): string => `
    <div class="qr-cell" style="visibility: hidden;"></div>
  `;

	// Split QR codes into pages (8 per page)
	const pages: QRCodeData[][] = [];
	for (let i = 0; i < qrCodeData.length; i += 8) {
		pages.push(qrCodeData.slice(i, i + 8));
	}

	// Generate HTML for all pages
	const pagesHTML = pages
		.map((pageData, pageIndex) => {
			const cellsHTML = pageData.map(generateQRCell).join("");

			// Fill remaining slots with empty cells
			const emptyCount = 8 - pageData.length;
			const emptyCellsHTML =
				emptyCount > 0
					? Array(emptyCount).fill(null).map(generateEmptyCell).join("")
					: "";

			return `
      <div class="page${pageIndex < pages.length - 1 ? " page-break" : ""}">
        <div class="page-header">
          <h1>Universidad de las Artes de Yucatán</h1>
          <p>Grupo Primero A - Catálogo de Obras</p>
        </div>
        <div class="qr-grid">
          ${cellsHTML}
          ${emptyCellsHTML}
        </div>
        <div class="page-footer">
          <p>Página ${pageIndex + 1} de ${pages.length}</p>
        </div>
      </div>
    `;
		})
		.join("");

	// Complete HTML document with inline styles
	return /* html */ `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catálogo QR - Universidad de las Artes de Yucatán</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      width: 21cm;
      height: 29.7cm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .page {
      width: 21cm;
      height: 29.7cm;
      padding: 0.8cm;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .page-header {
      text-align: center;
      margin-bottom: 0.5cm;
      padding-bottom: 0.3cm;
      border-bottom: 2px solid #333;
    }

    .page-header h1 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 0.3cm;
    }

    .page-header p {
      font-size: 0.9rem;
      color: #666;
    }

    /* Grid layout for QR codes
     * A4 portrait: 210mm x 297mm (21cm x 29.7cm)
     * With 0.8cm margins and header/footer: ~26cm usable height
     * 2 columns x 4 rows = 8 QR codes per page
     */
    .qr-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(4, 1fr);
      gap: 0.4cm;
      margin-bottom: 0.3cm;
    }

    .qr-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.2cm;
      border: 1px solid #ddd;
      border-radius: 4px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .qr-image {
      width: 4.5cm;
      height: 4.5cm;
      margin-bottom: 0.2cm;
    }

    .artwork-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1a1a1a;
      text-align: center;
      line-height: 1.2;
      margin-bottom: 0.1cm;
    }

    .artwork-author {
      font-size: 0.65rem;
      color: #666;
      text-align: center;
      line-height: 1.2;
    }

    .page-footer {
      text-align: center;
      padding-top: 0.2cm;
      border-top: 1px solid #ddd;
    }

    .page-footer p {
      font-size: 0.7rem;
      color: #999;
    }
  </style>
</head>
<body>
  ${pagesHTML}
</body>
</html>
  `.trim();
}
