import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkCard } from "~/components/ArtworkCard";
import {
	getArtworksByCategory,
	getCategoryBySlug,
} from "~/sanity/lib/queries";

interface CategoryPageProps {
	params: Promise<{ slug: string }>;
}

// Force dynamic rendering to always fetch fresh data from Sanity
export const dynamic = "force-dynamic";

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
		title: `${category.title} | UNAY Artes Visuales`,
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
			{/* Header with back navigation */}
			<header className="border-neutral-200 border-b bg-white">
				<div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
					<Link
						href="/"
						className="inline-flex items-center text-neutral-600 text-sm transition-colors hover:text-neutral-900"
					>
						← Volver a categorías
					</Link>
				</div>
			</header>

			{/* Category header */}
			<div className="border-neutral-200 border-b bg-neutral-50">
				<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
					<h1 className="font-bold text-3xl text-neutral-900 sm:text-4xl">
						{category.title}
					</h1>
					{category.description && (
						<p className="mt-2 text-neutral-600">{category.description}</p>
					)}
					<p className="mt-2 text-neutral-500 text-sm">
						{artworks.length} {artworks.length === 1 ? "obra" : "obras"}
					</p>
				</div>
			</div>

			{/* Artwork Grid */}
			<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
				{artworks.length === 0 ? (
					// Empty state
					<div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
						<p className="text-neutral-600 text-xl">
							No hay obras en esta categoría
						</p>
						<Link
							href="/"
							className="mt-4 text-neutral-900 text-sm hover:underline"
						>
							← Volver a categorías
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
		</main>
	);
}
