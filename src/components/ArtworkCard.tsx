import Image from "next/image";
import Link from "next/link";
import { getGridImageUrl } from "~/sanity/lib/image";
import type { ArtworkGridItem } from "~/sanity/types";

interface ArtworkCardProps {
	artwork: ArtworkGridItem;
}

/**
 * ArtworkCard component for gallery grid
 * Displays artwork thumbnail with title and metadata
 * Optimized for performance with Next.js Image and lazy loading
 */
export function ArtworkCard({ artwork }: ArtworkCardProps) {
	const imageUrl = getGridImageUrl(artwork.image, 800);

	return (
		<Link
			href={`/obra/${artwork.slug.current}`}
			className="group relative block overflow-hidden rounded-lg bg-neutral-100 transition-transform duration-300 hover:scale-[1.02]"
		>
			{/* Image container with aspect ratio */}
			<div className="relative aspect-[4/5] w-full overflow-hidden">
				<Image
					src={imageUrl}
					alt={artwork.image.alt}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					loading="lazy"
				/>

				{/* Overlay on hover */}
				<div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
			</div>

			{/* Metadata */}
			<div className="p-4">
				<h3 className="line-clamp-1 font-medium text-neutral-900">
					{artwork.title}
				</h3>

				{/* Category and year */}
				{(artwork.category || artwork.year) && (
					<p className="mt-1 text-neutral-600 text-sm">
						{[artwork.category?.title, artwork.year]
							.filter(Boolean)
							.join(" • ")}
					</p>
				)}
			</div>
		</Link>
	);
}
