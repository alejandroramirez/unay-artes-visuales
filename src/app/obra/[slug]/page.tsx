import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkImageViewer } from "~/components/ArtworkImageViewer";
import { getBlurDataUrl, getDetailImageUrl } from "~/sanity/lib/image";
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

	const imageUrl = getDetailImageUrl(artwork.image, 1600);

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

	const imageUrl = getDetailImageUrl(artwork.image, 1600);
	const blurDataUrl = await getBlurDataUrl(artwork.image);

	return (
		<main className="min-h-screen bg-white">
			{/* Header with back navigation */}
			<header className="border-neutral-200 border-b bg-white">
				<div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
					{artwork.category ? (
						<Link
							href={`/categoria/${artwork.category.slug.current}`}
							className="inline-flex items-center text-neutral-600 text-sm transition-colors hover:text-neutral-900"
						>
							← Volver a {artwork.category.title}
						</Link>
					) : (
						<Link
							href="/"
							className="inline-flex items-center text-neutral-600 text-sm transition-colors hover:text-neutral-900"
						>
							← Volver a categorías
						</Link>
					)}
				</div>
			</header>

			{/* Artwork content */}
			<div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
					{/* Image with full-page view */}
					<ArtworkImageViewer
						imageUrl={imageUrl}
						alt={artwork.image.alt}
						blurDataUrl={blurDataUrl}
					/>

					{/* Metadata */}
					<div className="flex flex-col lg:col-span-1">
						{/* Title */}
						<h1 className="font-bold text-3xl text-neutral-900 sm:text-4xl">
							{artwork.title}
						</h1>

						{/* Breadcrumb navigation */}
						<nav className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
							<Link href="/" className="transition-colors hover:text-neutral-900">
								Inicio
							</Link>
							<span>/</span>
							{artwork.category && (
								<>
									<Link
										href={`/categoria/${artwork.category.slug.current}`}
										className="transition-colors hover:text-neutral-900"
									>
										{artwork.category.title}
									</Link>
									<span>/</span>
								</>
							)}
							<span className="text-neutral-900">{artwork.title}</span>
						</nav>

						{/* Author */}
						{artwork.autor && (
							<p className="mt-4 text-neutral-700 text-xl">{artwork.autor}</p>
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
