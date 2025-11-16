"use client";

import { useState } from "react";

export function PrintButton() {
	const [isLoading, setIsLoading] = useState(false);

	const handleDownloadPDF = async () => {
		try {
			setIsLoading(true);

			// Fetch PDF from API
			const response = await fetch("/api/etiquetas/pdf");

			if (!response.ok) {
				throw new Error("Failed to generate PDF");
			}

			// Create blob and download
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;

			// Extract filename from Content-Disposition header or use default
			const contentDisposition = response.headers.get("Content-Disposition");
			const filename =
				contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ??
				"etiquetas-unay.pdf";

			link.download = filename;
			document.body.appendChild(link);
			link.click();

			// Cleanup
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading PDF:", error);
			alert("Error al generar el PDF. Por favor intente nuevamente.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			className="print-button"
			onClick={handleDownloadPDF}
			disabled={isLoading}
			type="button"
		>
			{isLoading ? "Generando PDF..." : "Descargar Etiquetas PDF"}
		</button>
	);
}
