import { TagIcon } from "@sanity/icons";
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
			name: "order",
			title: "Order",
			type: "number",
			description:
				"Order in which this category appears (lower numbers appear first)",
			validation: (Rule) => Rule.integer().min(0),
			hidden: true, // Hidden - ordering is now managed by drag-and-drop
		}),
		defineField({
			name: "orderRank",
			title: "Order Rank",
			type: "string",
			description: "Used for drag-and-drop ordering in Studio (managed automatically)",
			hidden: true, // Hide from editors since it's managed by the plugin
		}),
	],
	preview: {
		select: {
			title: "title",
			order: "order",
		},
		prepare({ title, order }) {
			return {
				title: title,
				subtitle: order !== undefined ? `Order: ${order}` : "No order set",
			};
		},
	},
});
