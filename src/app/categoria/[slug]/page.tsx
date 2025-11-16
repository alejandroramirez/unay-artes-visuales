import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "~/components/ArtworkCard";
import { CategoryScrollRestorer } from "~/components/CategoryScrollRestorer";
import { getArtworksByCategory, getCategoryBySlug } from "~/sanity/lib/queries";

interface CategoryPageProps {
	params: Promise<{ slug: string }>;
}

// Enable ISR with 60 second revalidation
export const revalidate = 60;

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
	params,
}: CategoryPageProps): Promise<Metadata> {
	const { slug } = await params;
	const category = await getCategoryBySlug(slug);

	if (!category) {
		return {
			title: "Categoría no encontrada",
		};
	}

	return {
		title: `${category.title} | Universidad de las Artes de Yucatán`,
		description:
			category.description ||
			`Explora las obras de la categoría ${category.title}`,
	};
}

/**
 * Category Page
 * Shows all artworks in a specific category
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
	const { slug } = await params;
	const category = await getCategoryBySlug(slug);

	if (!category) {
		notFound();
	}

	const artworks = await getArtworksByCategory(slug);

	return (
		<main className="min-h-screen bg-white">
			{/* Restore scroll position when returning from artwork detail */}
			<CategoryScrollRestorer categorySlug={slug} />

			{/* Artwork Grid */}
			<div className="container mx-auto px-3 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
				{/* Category header */}
				<div className="mb-12">
					<h1
						className="mb-3 text-2xl tracking-tight sm:text-3xl"
						style={{ color: "#1a1a1a" }}
					>
						{category.title}
					</h1>

					{/* Breadcrumb navigation */}
					<nav
						className="mb-4 flex items-center gap-2 text-sm"
						style={{ color: "#999999" }}
					>
						<Link href="/" className="transition-opacity hover:opacity-70">
							Inicio
						</Link>
						<span>/</span>
						<span style={{ color: "#1a1a1a" }}>{category.title}</span>
					</nav>

					{category.description && (
						<p className="mb-2 text-sm" style={{ color: "#666666" }}>
							{category.description}
						</p>
					)}
					<p className="text-sm" style={{ color: "#999999" }}>
						{artworks.length} {artworks.length === 1 ? "obra" : "obras"}
					</p>
				</div>

				{artworks.length === 0 ? (
					// Empty state
					<div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
						<p className="text-xl" style={{ color: "#999999" }}>
							No hay obras en esta categoría
						</p>
						<Link
							href="/"
							className="mt-4 text-sm transition-opacity hover:opacity-70"
							style={{ color: "#1a1a1a" }}
						>
							← Volver a categorías
						</Link>
					</div>
				) : (
					// Responsive grid with generous spacing
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3 lg:gap-16 xl:grid-cols-4">
						{artworks.map((artwork) => (
							<ArtworkCard key={artwork._id} artwork={artwork} />
						))}
					</div>
				)}
			</div>
		</main>
	);
}
