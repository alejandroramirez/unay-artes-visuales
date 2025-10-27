import Link from "next/link";
import { ArtworkCard } from "~/components/ArtworkCard";
import { getAllArtwork } from "~/sanity/lib/queries";

/**
 * Homepage - Gallery Grid
 * Displays all artwork in a responsive masonry-style grid
 * Server component that fetches data at build time
 */
export default async function HomePage() {
	const artworks = await getAllArtwork();

	return (
		<main className="min-h-screen bg-white">
			{/* Header */}
			<header className="border-neutral-200 border-b bg-white">
				<div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
					<h1 className="font-bold text-2xl text-neutral-900 sm:text-3xl">
						UNAY Artes Visuales
					</h1>
				</div>
			</header>

			{/* Gallery Grid */}
			<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
				{artworks.length === 0 ? (
					// Empty state
					<div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
						<p className="mb-4 text-neutral-600 text-xl">
							Aún no hay obras en la galería
						</p>
						<Link
							href="/studio"
							className="rounded-lg bg-neutral-900 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-800"
						>
							Agregar primera obra →
						</Link>
					</div>
				) : (
					// Responsive grid
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{artworks.map((artwork) => (
							<ArtworkCard key={artwork._id} artwork={artwork} />
						))}
					</div>
				)}
			</div>

			{/* Footer with Studio link */}
			<footer className="mt-16 border-neutral-200 border-t bg-neutral-50">
				<div className="container mx-auto px-4 py-6 text-center sm:px-6 lg:px-8">
					<Link
						href="/studio"
						className="text-neutral-600 text-sm transition-colors hover:text-neutral-900"
					>
						Administrar contenido →
					</Link>
				</div>
			</footer>
		</main>
	);
}
