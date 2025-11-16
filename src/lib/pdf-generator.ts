/**
 * PDF Generation Utility
 * Uses Puppeteer to convert HTML to PDF with precise control
 * Optimized for both local development and Vercel serverless deployment
 */

interface PDFOptions {
	format?: "A4" | "Letter";
	landscape?: boolean;
	margin?: {
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	};
}

/**
 * Generate a PDF from HTML string
 * @param html - Complete HTML document as string
 * @param options - PDF generation options
 * @returns PDF as Buffer
 */
export async function generatePDF(
	html: string,
	options?: PDFOptions,
): Promise<Buffer> {
	// Dynamic imports to avoid bundling puppeteer on client side
	const puppeteer = await import("puppeteer");
	const chromium = await import("@sparticuz/chromium");

	const isLocal = process.env.NODE_ENV === "development";

	let browser;

	try {
		if (isLocal) {
			// Local development: use local Chrome
			browser = await puppeteer.default.launch({
				headless: true,
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			});
		} else {
			// Production/Vercel: use optimized chromium binary
			browser = await puppeteer.default.launch({
				args: chromium.default.args,
				executablePath: await chromium.default.executablePath(),
				headless: true,
			});
		}

		const page = await browser.newPage();

		// Load HTML and wait for all resources (fonts, images, etc.)
		await page.setContent(html, {
			waitUntil: "networkidle0",
			timeout: 30000,
		});

		// Generate PDF with specified options
		const pdf = await page.pdf({
			format: options?.format ?? "A4",
			landscape: options?.landscape ?? false,
			printBackground: true,
			margin: options?.margin ?? {
				top: "1.5cm",
				right: "1.5cm",
				bottom: "1.5cm",
				left: "1.5cm",
			},
		});

		return Buffer.from(pdf);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
