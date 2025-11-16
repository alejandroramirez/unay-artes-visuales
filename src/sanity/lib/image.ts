import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

import { dataset, projectId } from "../env";

/**
 * Sanity image URL builder with optimizations
 * https://www.sanity.io/docs/image-url
 */
const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * Base URL builder for Sanity images
 * Use this for custom image configurations
 */
export const urlFor = (source: Image) => {
	return builder.image(source);
};

/**
 * Get optimized image URL for gallery grid thumbnails
 * - Responsive width
 * - Auto format (WebP with JPEG fallback)
 * - Quality optimized for web
 */
export const getGridImageUrl = (source: Image, width = 800) => {
	return builder
		.image(source)
		.width(width)
		.quality(85)
		.auto("format")
		.fit("max")
		.url();
};

/**
 * Get optimized image URL for detail view
 * - Higher quality
 * - Larger size
 * - Auto format
 */
export const getDetailImageUrl = (source: Image, width = 1920) => {
	return builder
		.image(source)
		.width(width)
		.quality(90)
		.auto("format")
		.fit("max")
		.url();
};

/**
 * Get blur placeholder URL (LQIP - Low Quality Image Placeholder)
 * Returns a tiny image URL for progressive loading
 */
export const getBlurImageUrl = (source: Image) => {
	return builder.image(source).width(20).quality(30).blur(50).url();
};

/**
 * Generate base64 blur data URL for Next.js Image placeholder
 * Fetches tiny blur image and converts to base64
 */
export const getBlurDataUrl = async (source: Image): Promise<string> => {
	const blurUrl = getBlurImageUrl(source);

	try {
		const response = await fetch(blurUrl);
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64 = buffer.toString("base64");
		const mimeType = response.headers.get("content-type") || "image/jpeg";

		return `data:${mimeType};base64,${base64}`;
	} catch (_error) {
		// Fallback to a simple gray placeholder if fetch fails
		// 1x1 pixel gray PNG
		return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8+ehRPQAJBQNm4btqOAAAAABJRU5ErkJggg==";
	}
};
