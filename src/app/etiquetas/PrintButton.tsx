"use client";

export function PrintButton() {
	return (
		<button
			className="print-button"
			onClick={() => window.print()}
			type="button"
		>
			Imprimir Etiquetas
		</button>
	);
}
