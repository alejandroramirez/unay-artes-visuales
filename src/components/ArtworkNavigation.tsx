"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { Image as SanityImage } from "sanity";
import { getGridImageUrl } from "~/sanity/lib/image";

interface NavigationArtwork {
	_id: string;
	slug: { current: string };
	title: string;
	image: SanityImage & { alt: string };
}

interface ArtworkNavigationProps {
	currentSlug: string;
	allArtworks: NavigationArtwork[];
}

/**
 * ArtworkNavigation component for navigating between artworks in a category
 * Displays position indicator, prev/next arrows, and handles swipe gestures
 * Preloads adjacent images for smooth UX
 */
export function ArtworkNavigation({
	currentSlug,
	allArtworks,
}: ArtworkNavigationProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isNavigating, setIsNavigating] = useState(false);
	const [touchStart, setTouchStart] = useState(0);
	const [touchEnd, setTouchEnd] = useState(0);

	// Find current position
	const currentIndex = allArtworks.findIndex(
		(artwork) => artwork.slug.current === currentSlug,
	);
	const prevArtwork = currentIndex > 0 ? allArtworks[currentIndex - 1] : null;
	const nextArtwork =
		currentIndex < allArtworks.length - 1
			? allArtworks[currentIndex + 1]
			: null;

	const totalCount = allArtworks.length;
	const position = currentIndex + 1;

	const isLoading = isPending || isNavigating;

	// Navigate to artwork
	const navigateToArtwork = useCallback(
		(slug: string) => {
			setIsNavigating(true);
			startTransition(() => {
				router.push(`/obra/${slug}`);
			});
		},
		[router],
	);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isLoading) return;

			if (e.key === "ArrowLeft" && prevArtwork) {
				e.preventDefault();
				navigateToArtwork(prevArtwork.slug.current);
			} else if (e.key === "ArrowRight" && nextArtwork) {
				e.preventDefault();
				navigateToArtwork(nextArtwork.slug.current);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [prevArtwork, nextArtwork, isLoading, navigateToArtwork]);

	// Swipe detection
	const minSwipeDistance = 50;

	const onTouchStart = (e: React.TouchEvent) => {
		setTouchEnd(0); // Reset
		setTouchStart(e.targetTouches[0]?.clientX ?? 0);
	};

	const onTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0]?.clientX ?? 0);
	};

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return;

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > minSwipeDistance;
		const isRightSwipe = distance < -minSwipeDistance;

		if (isLeftSwipe && nextArtwork && !isLoading) {
			navigateToArtwork(nextArtwork.slug.current);
		}

		if (isRightSwipe && prevArtwork && !isLoading) {
			navigateToArtwork(prevArtwork.slug.current);
		}
	};

	return (
		<div
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onTouchEnd={onTouchEnd}
			className="w-full"
		>
			{/* Navigation Controls */}
			<div className="flex items-center justify-between gap-4">
				{/* Previous Button */}
				<button
					type="button"
					onClick={() =>
						prevArtwork && navigateToArtwork(prevArtwork.slug.current)
					}
					disabled={!prevArtwork || isLoading}
					className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
					style={{ color: "#1a1a1a" }}
					aria-label="Obra anterior"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="flex-shrink-0"
					>
						<path
							d="M12.5 15L7.5 10L12.5 5"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<span className="hidden sm:inline">Anterior</span>
				</button>

				{/* Position Indicator */}
				<div className="text-sm" style={{ color: "#999999" }}>
					{position} / {totalCount}
				</div>

				{/* Next Button */}
				<button
					type="button"
					onClick={() =>
						nextArtwork && navigateToArtwork(nextArtwork.slug.current)
					}
					disabled={!nextArtwork || isLoading}
					className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
					style={{ color: "#1a1a1a" }}
					aria-label="Siguiente obra"
				>
					<span className="hidden sm:inline">Siguiente</span>
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="flex-shrink-0"
					>
						<path
							d="M7.5 15L12.5 10L7.5 5"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>

			{/* Preload next artwork image */}
			{nextArtwork && (
				<div className="hidden">
					<Image
						src={getGridImageUrl(nextArtwork.image, 1600)}
						alt={nextArtwork.image.alt}
						width={1600}
						height={1600}
						priority
					/>
				</div>
			)}

			{/* Loading indicator */}
			{isLoading && (
				<div className="mt-4 flex items-center justify-center">
					<div
						className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
						style={{ borderColor: "#1a1a1a", borderTopColor: "transparent" }}
					/>
				</div>
			)}
		</div>
	);
}
