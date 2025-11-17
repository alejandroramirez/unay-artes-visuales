import type { Category } from "~/sanity/types";

interface CategoryQRCodeData {
	category: Category;
	qrCodeDataUrl: string;
	url: string;
}

interface WebsiteQRCodeData {
	title: string;
	qrCodeDataUrl: string;
	url: string;
}

type QRCodeEntry = CategoryQRCodeData | WebsiteQRCodeData;

/**
 * Generate HTML for category QR code contact sheet PDF
 * Creates a print-ready document with 8 QR codes per A4 portrait page
 * Includes website homepage QR + all category QRs
 */
export function generateCategoryQRSheetHTML(
	websiteQR: WebsiteQRCodeData,
	categoryQRs: CategoryQRCodeData[],
): string {
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

	// Generate QR code cell HTML for website
	const generateWebsiteQRCell = (data: WebsiteQRCodeData): string => `
    <div class="qr-cell website-cell">
      <img src="${data.qrCodeDataUrl}" alt="QR Code for ${escapeHTML(data.title)}" class="qr-image" />
      <p class="item-title">${escapeHTML(data.title)}</p>
      <p class="item-subtitle">Sitio Web Principal</p>
    </div>
  `;

	// Generate QR code cell HTML for category
	const generateCategoryQRCell = (data: CategoryQRCodeData): string => `
    <div class="qr-cell">
      <img src="${data.qrCodeDataUrl}" alt="QR Code for ${escapeHTML(data.category.title)}" class="qr-image" />
      <p class="item-title">${escapeHTML(data.category.title)}</p>
      ${data.category.description ? `<p class="item-subtitle">${escapeHTML(data.category.description)}</p>` : '<p class="item-subtitle">Categoría</p>'}
    </div>
  `;

	// Generate empty cell for grid filling
	const generateEmptyCell = (): string => `
    <div class="qr-cell" style="visibility: hidden;"></div>
  `;

	// Combine all QR codes (website first, then categories)
	const allQRs = [websiteQR, ...categoryQRs];

	// Split QR codes into pages (8 per page)
	const pages: QRCodeEntry[][] = [];
	for (let i = 0; i < allQRs.length; i += 8) {
		pages.push(allQRs.slice(i, i + 8));
	}

	// Generate HTML for all pages
	const pagesHTML = pages
		.map((pageData, pageIndex) => {
			const cellsHTML = pageData
				.map((item, index) => {
					// First item on first page is the website QR
					if (pageIndex === 0 && index === 0) {
						return generateWebsiteQRCell(item as WebsiteQRCodeData);
					}
					return generateCategoryQRCell(item as CategoryQRCodeData);
				})
				.join("");

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
          <p>Grupo Primero A - Catálogo de Categorías</p>
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
  <title>Catálogo QR Categorías - Universidad de las Artes de Yucatán</title>
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
      padding: 1.5cm;
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
      margin-bottom: 1cm;
      padding-bottom: 0.5cm;
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
     * With 1.5cm margins and header/footer: ~24cm usable height
     * 2 columns x 4 rows = 8 QR codes per page
     */
    .qr-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(4, 1fr);
      gap: 0.8cm;
      margin-bottom: 0.5cm;
    }

    .qr-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.5cm;
      border: 1px solid #ddd;
      border-radius: 4px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .website-cell {
      border: 2px solid #333;
      background-color: #f8f8f8;
    }

    .qr-image {
      width: 5cm;
      height: 5cm;
      margin-bottom: 0.3cm;
    }

    .item-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1a1a1a;
      text-align: center;
      line-height: 1.2;
      margin-bottom: 0.1cm;
    }

    .item-subtitle {
      font-size: 0.65rem;
      color: #666;
      text-align: center;
      line-height: 1.2;
    }

    .page-footer {
      text-align: center;
      padding-top: 0.3cm;
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
