import type { Artwork } from "~/sanity/types";

/**
 * Generate HTML for artwork labels PDF
 * Creates a print-ready document with 4 labels per A4 landscape page
 */
export function generateLabelsPDFHTML(
	artworks: Omit<Artwork, "description">[],
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

	// Generate label HTML for a single artwork
	const generateLabel = (artwork: Omit<Artwork, "description">): string => `
    <div class="label">
      <h2 class="label-title">${escapeHTML(artwork.title)}</h2>
      <div class="label-divider"></div>
      ${
				artwork.autor
					? `<p class="label-field"><span class="label-field-name">Autor:</span> ${escapeHTML(artwork.autor)}</p>`
					: ""
			}
      ${
				artwork.year
					? `<p class="label-field"><span class="label-field-name">Año:</span> ${escapeHTML(artwork.year)}</p>`
					: ""
			}
      ${
				artwork.medium
					? `<p class="label-field"><span class="label-field-name">Técnica:</span> ${escapeHTML(artwork.medium)}</p>`
					: ""
			}
      ${
				artwork.dimensions
					? `<p class="label-field"><span class="label-field-name">Dimensiones:</span> ${escapeHTML(artwork.dimensions)}</p>`
					: ""
			}
      ${
				artwork.category
					? `<p class="label-field"><span class="label-field-name">Categoría:</span> ${escapeHTML(artwork.category.title)}</p>`
					: ""
			}
    </div>
  `;

	// Generate empty label for grid filling
	const generateEmptyLabel = (): string => `
    <div class="label" style="visibility: hidden;"></div>
  `;

	// Split artworks into pages (4 per page)
	const pages: Array<Omit<Artwork, "description">[]> = [];
	for (let i = 0; i < artworks.length; i += 4) {
		pages.push(artworks.slice(i, i + 4));
	}

	// Generate HTML for all pages
	const pagesHTML = pages
		.map((pageArtworks, pageIndex) => {
			const labelsHTML = pageArtworks.map(generateLabel).join("");

			// Fill remaining slots with empty labels
			const emptyCount = 4 - pageArtworks.length;
			const emptyLabelsHTML =
				emptyCount > 0
					? Array(emptyCount).fill(null).map(generateEmptyLabel).join("")
					: "";

			return `
      <div class="page${pageIndex < pages.length - 1 ? " page-break" : ""}">
        <div class="labels-grid">
          ${labelsHTML}
          ${emptyLabelsHTML}
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
  <title>Etiquetas para Exhibición</title>
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
      width: 29.7cm;
      height: 21cm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .page {
      width: 29.7cm;
      height: 21cm;
      padding: 1.5cm;
      background: white;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    /* Precise grid layout for A4 landscape
     * A4 landscape: 297mm x 210mm (29.7cm x 21cm)
     * With 1.5cm margins: 26.7cm x 18cm usable area
     * Gap between labels: 1cm
     * Each label: 12.85cm x 8.5cm
     */
    .labels-grid {
      display: grid;
      grid-template-columns: 12.85cm 12.85cm;
      grid-template-rows: 8.5cm 8.5cm;
      gap: 1cm;
      width: 26.7cm;
      height: 18cm;
    }

    .label {
      border: 1px solid #999;
      padding: 0.8cm;
      width: 12.85cm;
      height: 8.5cm;
      display: flex;
      flex-direction: column;
      gap: 0.4cm;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .label-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #000;
      line-height: 1.2;
      margin: 0;
    }

    .label-divider {
      height: 1px;
      background: #999;
      margin: 0.2cm 0;
    }

    .label-field {
      font-size: 0.85rem;
      color: #000;
      line-height: 1.3;
      margin: 0;
    }

    .label-field-name {
      font-weight: 600;
      color: #333;
      display: inline-block;
      min-width: 2.2cm;
    }
  </style>
</head>
<body>
  ${pagesHTML}
</body>
</html>
  `.trim();
}
