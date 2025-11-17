import { TagIcon } from "@sanity/icons";
import {
	orderRankField,
	orderRankOrdering,
} from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

export const categoryType = defineType({
	name: "category",
	title: "Category",
	type: "document",
	icon: TagIcon,
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			description: 'Category name (e.g., "Grabados", "Pinturas")',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			description: "URL-friendly identifier (auto-generated from title)",
			options: {
				source: "title",
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			description: "Brief description of this category (optional)",
			rows: 3,
		}),
		defineField({
			name: "thumbnailArtwork",
			title: "Thumbnail Artwork",
			type: "reference",
			to: [{ type: "artwork" }],
			description:
				"Select an artwork to use as the category thumbnail. If not set, the first artwork will be used.",
			options: {
				filter: ({ document }) => {
					// Only show artworks that belong to this category
					const docId = document._id;
					if (!docId) {
						return { filter: '_type == "artwork"' };
					}
					// Strip the drafts. prefix if present to get the base ID
					const baseId = docId.replace("drafts.", "");
					return {
						filter:
							'_type == "artwork" && category._ref in [$categoryId, $baseId]',
						params: {
							categoryId: docId,
							baseId: baseId,
						},
					};
				},
			},
		}),
		/**
		 * OrderRank field for drag-and-drop ordering in Studio
		 *
		 * AUTO-INITIALIZES: For documents created in Sanity Studio UI
		 * MANUAL REQUIRED: For documents created programmatically (imports, API, scripts)
		 *
		 * If you create documents via API/scripts, use the orderRank utility:
		 * import { getNextOrderRank } from '~/sanity/lib/orderRank'
		 *
		 * Troubleshooting:
		 * - If you see "X/Y documents have no order" warning, run: pnpm fix:orderrank
		 * - Or use "Reset Order" option in Studio's orderable list menu
		 *
		 * See: /docs/orderrank-management.md
		 */
		orderRankField({ type: "category" }),
	],
	preview: {
		select: {
			title: "title",
		},
		prepare({ title }) {
			return {
				title: title,
			};
		},
	},
	orderings: [orderRankOrdering],
});
