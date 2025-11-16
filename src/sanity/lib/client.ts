import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	// Disable CDN in production for fresher data with on-demand revalidation
	// Keep CDN enabled in development for faster previews
	useCdn: process.env.NODE_ENV !== "production",
});
