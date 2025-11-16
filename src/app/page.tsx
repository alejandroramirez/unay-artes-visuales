import { CategoryCard } from "~/components/CategoryCard";
import { ThemeToggle } from "~/components/ThemeToggle";
import { getAllCategoriesWithArtwork } from "~/sanity/lib/queries";

/**
 * ISR configuration - revalidate every 60 seconds
 */
export const revalidate = 60;

/**
 * Homepage - Category Grid
 * Displays all categories with artworks in a responsive grid
 * Uses ISR (Incremental Static Regeneration) for performance with fresh data
 */
export default async function HomePage() {
	const categories = await getAllCategoriesWithArtwork();

	return (
		<main className="min-h-screen bg-background">
			{/* Category Grid */}
			<div className="container mx-auto px-3 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
				{/* Header */}
				<div className="mb-12 flex items-start justify-between">
					<div>
						<h1 className="mb-2 text-2xl text-foreground tracking-tight sm:text-3xl">
							Universidad de las Artes de Yucatán
						</h1>
						<p className="text-muted text-sm">Grupo Primero A</p>
					</div>
					<ThemeToggle />
				</div>

				{categories.length === 0 ? (
					// Empty state
					<div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
						<p className="text-muted text-xl">
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
