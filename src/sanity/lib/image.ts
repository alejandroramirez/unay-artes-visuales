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
 * Get blur placeholder data URL (LQIP - Low Quality Image Placeholder)
 * Used for progressive image loading
 */
export const getBlurDataUrl = (source: Image) => {
	return builder.image(source).width(20).quality(30).blur(50).url();
};
