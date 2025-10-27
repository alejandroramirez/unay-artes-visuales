import Link from "next/link";

/**
 * Not Found Page for artwork
 * Displayed when an artwork slug doesn't exist
 */
export default function NotFound() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-white px-4">
			<div className="text-center">
				<h1 className="mb-4 font-bold text-4xl text-neutral-900">
					Obra no encontrada
				</h1>
				<p className="mb-8 text-lg text-neutral-600">
					La obra que buscas no existe o ha sido removida.
				</p>
				<Link
					href="/"
					className="inline-block rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-800"
				>
					← Volver a la galería
				</Link>
			</div>
		</main>
	);
}
