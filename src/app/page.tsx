import { ArtworkCard } from "~/components/ArtworkCard";
import { getAllArtwork } from "~/sanity/lib/queries";

// Force dynamic rendering to always fetch fresh data from Sanity
export const dynamic = "force-dynamic";

/**
 * Homepage - Gallery Grid
 * Displays all artwork in a responsive masonry-style grid
 * Server component that fetches fresh data on every request
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
						<p className="text-neutral-600 text-xl">
							Aún no hay obras en la galería
						</p>
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
		</main>
	);
}
