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
 * Displays side chevrons and position indicator, handles keyboard and swipe gestures
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
		<>
			{/* Touch area for swipe detection */}
			<div
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
				className="pointer-events-none fixed inset-0 z-40"
			/>

			{/* Previous Button - Left Side */}
			{prevArtwork && (
				<Link
					href={`/obra/${prevArtwork.slug.current}`}
					className="-translate-y-1/2 fixed top-1/2 left-4 z-50 p-3 text-foreground transition-opacity hover:opacity-70"
					aria-label="Obra anterior"
					prefetch={true}
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M15 18L9 12L15 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Link>
			)}

			{/* Next Button - Right Side */}
			{nextArtwork && (
				<Link
					href={`/obra/${nextArtwork.slug.current}`}
					className="-translate-y-1/2 fixed top-1/2 right-4 z-50 p-3 text-foreground transition-opacity hover:opacity-70"
					aria-label="Siguiente obra"
					prefetch={true}
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M9 18L15 12L9 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Link>
			)}

			{/* Position Indicator - Bottom Center */}
			<div className="flex justify-center">
				<div className="text-muted text-sm">
					{position} / {totalCount}
				</div>
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
		</>
	);
}
