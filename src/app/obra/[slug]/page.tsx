import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDetailImageUrl } from "~/sanity/lib/image";
import { getAllArtworkSlugs, getArtworkBySlug } from "~/sanity/lib/queries";

interface ArtworkPageProps {
	params: Promise<{ slug: string }>;
}

// Force dynamic rendering to always fetch fresh data from Sanity
export const dynamic = "force-dynamic";

/**
 * generateStaticParams is disabled for dynamic rendering
 * All artwork pages are now rendered on-demand with fresh data
 */
// export async function generateStaticParams() {
// 	const slugs = await getAllArtworkSlugs();
// 	return slugs.map((slug) => ({
// 		slug,
// 	}));
// }

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

	const imageUrl = getDetailImageUrl(artwork.image, 1200);

	return {
		title: `${artwork.title} | UNAY Artes Visuales`,
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
 * Shows full artwork image with complete metadata
 */
export default async function ArtworkPage({ params }: ArtworkPageProps) {
	const { slug } = await params;
	const artwork = await getArtworkBySlug(slug);

	if (!artwork) {
		notFound();
	}

	const imageUrl = getDetailImageUrl(artwork.image, 1920);

	return (
		<main className="min-h-screen bg-white">
			{/* Header with back navigation */}
			<header className="border-neutral-200 border-b bg-white">
				<div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
					<Link
						href="/"
						className="inline-flex items-center text-neutral-600 text-sm transition-colors hover:text-neutral-900"
					>
						← Volver a la galería
					</Link>
				</div>
			</header>

			{/* Artwork content */}
			<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
					{/* Image */}
					<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
						<Image
							src={imageUrl}
							alt={artwork.image.alt}
							fill
							className="object-contain"
							sizes="(max-width: 1024px) 100vw, 50vw"
							priority
						/>
					</div>

					{/* Metadata */}
					<div className="flex flex-col">
						{/* Title */}
						<h1 className="font-bold text-3xl text-neutral-900 sm:text-4xl">
							{artwork.title}
						</h1>

						{/* Author */}
						{artwork.autor && (
							<p className="mt-2 text-neutral-700 text-xl">{artwork.autor}</p>
						)}

						{/* Basic info */}
						<div className="mt-4 space-y-2">
							{artwork.category && (
								<p className="text-neutral-600">
									<span className="font-medium">Categoría:</span>{" "}
									{artwork.category.title}
								</p>
							)}
							{artwork.year && (
								<p className="text-neutral-600">
									<span className="font-medium">Año:</span> {artwork.year}
								</p>
							)}
							{artwork.dimensions && (
								<p className="text-neutral-600">
									<span className="font-medium">Dimensiones:</span>{" "}
									{artwork.dimensions}
								</p>
							)}
							{artwork.medium && (
								<p className="text-neutral-600">
									<span className="font-medium">Técnica:</span> {artwork.medium}
								</p>
							)}
						</div>

						{/* Description / Artist statement */}
						{artwork.description && artwork.description.length > 0 && (
							<div className="mt-8">
								<h2 className="mb-4 font-semibold text-neutral-900 text-xl">
									Sobre la obra
								</h2>
								<div className="prose prose-neutral max-w-none">
									<PortableText value={artwork.description} />
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
