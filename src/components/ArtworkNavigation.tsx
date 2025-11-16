"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
 * Prefetches adjacent routes for instant navigation
 */
export function ArtworkNavigation({
	currentSlug,
	allArtworks,
}: ArtworkNavigationProps) {
	const router = useRouter();
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

	// Prefetch adjacent routes for instant navigation
	useEffect(() => {
		if (prevArtwork) {
			router.prefetch(`/obra/${prevArtwork.slug.current}`);
		}
		if (nextArtwork) {
			router.prefetch(`/obra/${nextArtwork.slug.current}`);
		}
	}, [prevArtwork, nextArtwork, router]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft" && prevArtwork) {
				e.preventDefault();
				router.push(`/obra/${prevArtwork.slug.current}`);
			} else if (e.key === "ArrowRight" && nextArtwork) {
				e.preventDefault();
				router.push(`/obra/${nextArtwork.slug.current}`);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [prevArtwork, nextArtwork, router]);

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

		if (isLeftSwipe && nextArtwork) {
			router.push(`/obra/${nextArtwork.slug.current}`);
		}

		if (isRightSwipe && prevArtwork) {
			router.push(`/obra/${prevArtwork.slug.current}`);
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
				{prevArtwork ? (
					<Link
						href={`/obra/${prevArtwork.slug.current}`}
						className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
						style={{ color: "#1a1a1a" }}
						aria-label="Obra anterior"
						prefetch={true}
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
					</Link>
				) : (
					<div
						className="flex items-center gap-2 text-sm opacity-30"
						style={{ color: "#1a1a1a" }}
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
					</div>
				)}

				{/* Position Indicator */}
				<div className="text-sm" style={{ color: "#999999" }}>
					{position} / {totalCount}
				</div>

				{/* Next Button */}
				{nextArtwork ? (
					<Link
						href={`/obra/${nextArtwork.slug.current}`}
						className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
						style={{ color: "#1a1a1a" }}
						aria-label="Siguiente obra"
						prefetch={true}
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
					</Link>
				) : (
					<div
						className="flex items-center gap-2 text-sm opacity-30"
						style={{ color: "#1a1a1a" }}
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
					</div>
				)}
			</div>

			{/* Preload next and previous artwork images */}
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
			{prevArtwork && (
				<div className="hidden">
					<Image
						src={getGridImageUrl(prevArtwork.image, 1600)}
						alt={prevArtwork.image.alt}
						width={1600}
						height={1600}
						priority
					/>
				</div>
			)}
		</div>
	);
}
