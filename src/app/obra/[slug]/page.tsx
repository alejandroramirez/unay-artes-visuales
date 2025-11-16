import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImageViewer } from "~/components/ArtworkImageViewer";
import { ArtworkNavigation } from "~/components/ArtworkNavigation";
import { ThemeToggle } from "~/components/ThemeToggle";
import { getBlurDataUrl, getDetailImageUrl } from "~/sanity/lib/image";
import {
	getArtworkBySlug,
	getArtworkWithNavigation,
} from "~/sanity/lib/queries";

interface ArtworkPageProps {
	params: Promise<{ slug: string }>;
}

// Enable ISR with 60 second revalidation
export const revalidate = 60;

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
	params,
}: ArtworkPageProps): Promise<Metadata> {
	const { slug } = await params;
	const artwork = await getArtworkBySlug(slug);

	if (!artwork) {
		return {
			title: "Obra no encontrada",
		};
	}

	const imageUrl = getDetailImageUrl(artwork.image, 1600);

	return {
		title: `${artwork.title} | Universidad de las Artes de Yucatán`,
		description: artwork.description
			? // Extract plain text from PortableText for meta description
				artwork.description
					.map((block) =>
						block._type === "block" && "children" in block && block.children
							? block.children
									.map((child) =>
										"text" in child && typeof child.text === "string"
											? child.text
											: "",
									)
									.join("")
							: "",
					)
					.join(" ")
					.slice(0, 160)
			: `${artwork.title} - ${[artwork.category?.title, artwork.year, artwork.medium].filter(Boolean).join(", ")}`,
		openGraph: {
			title: artwork.title,
			description: `${[artwork.category?.title, artwork.year, artwork.medium].filter(Boolean).join(" • ")}`,
			images: [
				{
					url: imageUrl,
					alt: artwork.image.alt,
				},
			],
		},
	};
}

/**
 * Artwork Detail Page
 * Shows full artwork image with complete metadata and navigation
 */
export default async function ArtworkPage({ params }: ArtworkPageProps) {
	const { slug } = await params;
	const data = await getArtworkWithNavigation(slug);

	if (!data || !data.artwork) {
		notFound();
	}

	const { artwork, allArtworksInCategory } = data;
	const imageUrl = getDetailImageUrl(artwork.image, 1600);
	const blurDataUrl = await getBlurDataUrl(artwork.image);

	return (
		<main className="min-h-screen bg-background">
			{/* Artwork content */}
			<div className="container mx-auto px-3 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
				{/* Header with breadcrumb and theme toggle */}
				<div className="mb-6 flex items-start justify-between">
					{/* Breadcrumb navigation */}
					{artwork.category && (
						<nav className="flex items-center gap-2 text-muted text-sm">
							<Link href="/" className="transition-opacity hover:opacity-70">
								Inicio
							</Link>
							<span>/</span>
							<Link
								href={`/categoria/${artwork.category.slug.current}`}
								className="transition-opacity hover:opacity-70"
							>
								{artwork.category.title}
							</Link>
							<span>/</span>
							<span className="text-foreground">{artwork.title}</span>
						</nav>
					)}
					<ThemeToggle />
				</div>

				<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3 lg:gap-16">
					{/* Image with full-page view */}
					<ArtworkImageViewer
						imageUrl={imageUrl}
						alt={artwork.image.alt}
						blurDataUrl={blurDataUrl}
					/>

					{/* Metadata */}
					<div className="flex flex-col lg:col-span-1">
						{/* Title and Author */}
						<div className="mb-8">
							<h1 className="mb-3 text-2xl text-foreground tracking-tight sm:text-3xl">
								{artwork.title}
							</h1>

							{artwork.autor && (
								<p className="text-base text-muted-dark">{artwork.autor}</p>
							)}
						</div>

						{/* Basic info */}
						<div className="space-y-3 border-border border-t pt-6">
							{artwork.year && (
								<div className="flex gap-4">
									<span className="w-24 flex-shrink-0 text-muted text-sm">
										Año
									</span>
									<span className="text-foreground text-sm">
										{artwork.year}
									</span>
								</div>
							)}
							{artwork.dimensions && (
								<div className="flex gap-4">
									<span className="w-24 flex-shrink-0 text-muted text-sm">
										Dimensiones
									</span>
									<span className="text-foreground text-sm">
										{artwork.dimensions}
									</span>
								</div>
							)}
							{artwork.medium && (
								<div className="flex gap-4">
									<span className="w-24 flex-shrink-0 text-muted text-sm">
										Técnica
									</span>
									<span className="text-foreground text-sm">
										{artwork.medium}
									</span>
								</div>
							)}
							{artwork.category && (
								<div className="flex gap-4">
									<span className="w-24 flex-shrink-0 text-muted text-sm">
										Categoría
									</span>
									<Link
										href={`/categoria/${artwork.category.slug.current}`}
										className="text-foreground text-sm transition-opacity hover:opacity-70"
									>
										{artwork.category.title}
									</Link>
								</div>
							)}
						</div>

						{/* Description / Artist statement */}
						{artwork.description && artwork.description.length > 0 && (
							<div className="mt-8 border-border border-t pt-6">
								<div className="text-foreground text-sm">
									<PortableText value={artwork.description} />
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Navigation Controls - Fixed position side arrows */}
			{allArtworksInCategory.length > 1 && (
				<ArtworkNavigation
					currentSlug={slug}
					allArtworks={allArtworksInCategory}
				/>
			)}
		</main>
	);
}
