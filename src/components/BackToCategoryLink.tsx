"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface BackToCategoryLinkProps {
	defaultCategory?: {
		title: string;
		slug: {
			current: string;
		};
	} | null;
}

/**
 * BackToCategoryLink component
 * Shows a "Back to Category" link that reads from sessionStorage to return
 * to the previously viewed category, or falls back to the artwork's category
 * Shows loading state during navigation
 */
export function BackToCategoryLink({
	defaultCategory,
}: BackToCategoryLinkProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isNavigating, setIsNavigating] = useState(false);
	const [returnInfo, setReturnInfo] = useState<{
		slug: string;
		title: string;
		href: string;
	} | null>(null);

	useEffect(() => {
		// Read from sessionStorage
		const categorySlug = sessionStorage.getItem("artworkReturnCategory");
		const categoryTitle = sessionStorage.getItem("artworkReturnCategoryTitle");

		if (categorySlug && categoryTitle) {
			setReturnInfo({
				slug: categorySlug,
				title: categoryTitle,
				href: `/categoria/${categorySlug}`,
			});
		} else if (defaultCategory) {
			// Fallback to artwork's category
			setReturnInfo({
				slug: defaultCategory.slug.current,
				title: defaultCategory.title,
				href: `/categoria/${defaultCategory.slug.current}`,
			});
		} else {
			// Fallback to home
			setReturnInfo({
				slug: "",
				title: "la galería",
				href: "/",
			});
		}
	}, [defaultCategory]);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		if (!returnInfo) return;

		setIsNavigating(true);
		startTransition(() => {
			router.push(returnInfo.href);
		});
	};

	const isLoading = isPending || isNavigating;

	if (!returnInfo) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isLoading}
			className="inline-flex items-center gap-2 text-foreground text-sm transition-opacity hover:opacity-70 disabled:opacity-50"
		>
			{isLoading ? (
				<>
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
					<span>Cargando...</span>
				</>
			) : (
				<>← Volver a {returnInfo.title}</>
			)}
		</button>
	);
}
