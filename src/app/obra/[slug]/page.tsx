import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImageViewer } from "~/components/ArtworkImageViewer";
import { ArtworkNavigation } from "~/components/ArtworkNavigation";
import { BackToCategoryLink } from "~/components/BackToCategoryLink";
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
		<main className="min-h-screen bg-white">
			{/* Artwork content */}
			<div className="container mx-auto px-3 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
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
							<h1
								className="mb-2 text-2xl tracking-tight sm:text-3xl"
								style={{ color: "#1a1a1a" }}
							>
								{artwork.title}
							</h1>
							{artwork.autor && (
								<p className="text-base" style={{ color: "#666666" }}>
									{artwork.autor}
								</p>
							)}
						</div>

						{/* Basic info */}
						<div
							className="space-y-3 border-t pt-6"
							style={{ borderColor: "#e5e5e5" }}
						>
							{artwork.year && (
								<div className="flex gap-4">
									<span
										className="w-24 flex-shrink-0 text-sm"
										style={{ color: "#999999" }}
									>
										Año
									</span>
									<span className="text-sm" style={{ color: "#1a1a1a" }}>
										{artwork.year}
									</span>
								</div>
							)}
							{artwork.dimensions && (
								<div className="flex gap-4">
									<span
										className="w-24 flex-shrink-0 text-sm"
										style={{ color: "#999999" }}
									>
										Dimensiones
									</span>
									<span className="text-sm" style={{ color: "#1a1a1a" }}>
										{artwork.dimensions}
									</span>
								</div>
							)}
							{artwork.medium && (
								<div className="flex gap-4">
									<span
										className="w-24 flex-shrink-0 text-sm"
										style={{ color: "#999999" }}
									>
										Técnica
									</span>
									<span className="text-sm" style={{ color: "#1a1a1a" }}>
										{artwork.medium}
									</span>
								</div>
							)}
							{artwork.category && (
								<div className="flex gap-4">
									<span
										className="w-24 flex-shrink-0 text-sm"
										style={{ color: "#999999" }}
									>
										Categoría
									</span>
									<Link
										href={`/categoria/${artwork.category.slug.current}`}
										className="text-sm transition-opacity hover:opacity-70"
										style={{ color: "#1a1a1a" }}
									>
										{artwork.category.title}
									</Link>
								</div>
							)}
						</div>

						{/* Description / Artist statement */}
						{artwork.description && artwork.description.length > 0 && (
							<div
								className="mt-8 border-t pt-6"
								style={{ borderColor: "#e5e5e5" }}
							>
								<div className="text-sm" style={{ color: "#1a1a1a" }}>
									<PortableText value={artwork.description} />
								</div>
							</div>
						)}

						{/* Back to category */}
						<div
							className="mt-8 border-t pt-6"
							style={{ borderColor: "#e5e5e5" }}
						>
							<BackToCategoryLink defaultCategory={artwork.category} />
						</div>
					</div>
				</div>

				{/* Navigation Controls */}
				{allArtworksInCategory.length > 1 && (
					<div
						className="mt-12 border-t pt-8"
						style={{ borderColor: "#e5e5e5" }}
					>
						<ArtworkNavigation
							currentSlug={slug}
							allArtworks={allArtworksInCategory}
						/>
					</div>
				)}
			</div>
		</main>
	);
}
