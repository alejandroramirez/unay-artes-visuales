import { CategoryCard } from "~/components/CategoryCard";
import { getAllCategoriesWithArtwork } from "~/sanity/lib/queries";

/**
 * Homepage - Category Grid
 * Displays all categories with artworks in a responsive grid
 * Fully static page generated at build time for maximum performance
 */
export default async function HomePage() {
	const categories = await getAllCategoriesWithArtwork();

	return (
		<main className="min-h-screen bg-white">
			{/* Category Grid */}
			<div className="container mx-auto px-3 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
				{/* Header */}
				<div className="mb-12">
					<h1
						className="mb-2 text-2xl tracking-tight sm:text-3xl"
						style={{ color: "#1a1a1a" }}
					>
						Universidad de las Artes de Yucatán
					</h1>
					<p className="text-sm" style={{ color: "#999999" }}>
						Grupo Primero A
					</p>
				</div>

				{categories.length === 0 ? (
					// Empty state
					<div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
						<p className="text-xl" style={{ color: "#999999" }}>
							Aún no hay categorías con obras
						</p>
					</div>
				) : (
					// Responsive grid with generous spacing
					<div className="grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-3 lg:gap-16 xl:grid-cols-4">
						{categories.map((category) => (
							<CategoryCard key={category._id} category={category} />
						))}
					</div>
				)}
			</div>
		</main>
	);
}
