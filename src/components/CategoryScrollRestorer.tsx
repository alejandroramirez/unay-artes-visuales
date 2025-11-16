"use client";

import { useEffect } from "react";

interface CategoryScrollRestorerProps {
	categorySlug: string;
}

/**
 * CategoryScrollRestorer component
 * Restores the scroll position when returning from an artwork detail page
 */
export function CategoryScrollRestorer({
	categorySlug,
}: CategoryScrollRestorerProps) {
	useEffect(() => {
		// Check if we should restore scroll position
		const returnCategory = sessionStorage.getItem("artworkReturnCategory");
		const scrollPosition = sessionStorage.getItem("categoryScrollPosition");

		if (returnCategory === categorySlug && scrollPosition) {
			// Restore scroll position after a small delay to ensure content is loaded
			const position = Number.parseInt(scrollPosition, 10);

			// Use requestAnimationFrame to ensure DOM is ready
			requestAnimationFrame(() => {
				window.scrollTo({
					top: position,
					behavior: "instant",
				});
			});

			// Clear the stored values
			sessionStorage.removeItem("artworkReturnCategory");
			sessionStorage.removeItem("artworkReturnCategoryTitle");
			sessionStorage.removeItem("categoryScrollPosition");
		}
	}, [categorySlug]);

	return null;
}
