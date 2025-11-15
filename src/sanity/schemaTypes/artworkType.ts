import { ImageIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const artworkType = defineType({
	name: "artwork",
	title: "Artwork",
	type: "document",
	icon: ImageIcon,
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			description: "Title of the artwork",
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
			name: "image",
			title: "Image",
			type: "image",
			description: "Main image of the artwork",
			options: {
				hotspot: true,
			},
			fields: [
				{
					name: "alt",
					type: "string",
					title: "Alternative text",
					description:
						"Important for SEO and accessibility. Describe the artwork.",
					validation: (Rule) => Rule.required(),
				},
			],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description / Artist Statement",
			type: "blockContent",
			description: "Rich text description or artist statement about the work",
		}),
		defineField({
			name: "autor",
			title: "Autor",
			type: "string",
			description: "Name of the artist",
			placeholder: 'e.g., "Ana García", "Carlos Martínez"',
		}),
		defineField({
			name: "category",
			title: "Category",
			type: "reference",
			to: [{ type: "category" }],
			description: 'Category or collection (e.g., "Grabados", "Pinturas")',
		}),
		defineField({
			name: "year",
			title: "Year",
			type: "string",
			description: "Year the artwork was created (e.g., 2024, 2023-2024)",
		}),
		defineField({
			name: "dimensions",
			title: "Dimensions",
			type: "string",
			description: 'Dimensions of the artwork (e.g., "24 x 36 inches")',
			placeholder: "24 x 36 inches or 61 x 91 cm",
		}),
		defineField({
			name: "medium",
			title: "Medium / Technique",
			type: "string",
			description: "Medium or technique used",
			placeholder: 'e.g., "Oil on canvas", "Digital print", "Grabado"',
		}),
		defineField({
			name: "order",
			title: "Order",
			type: "number",
			description:
				"Order in which this artwork appears in the gallery (lower numbers appear first)",
			validation: (Rule) => Rule.integer().min(0),
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
			media: "image",
			category: "category.title",
			year: "year",
		},
		prepare({ title, media, category, year }) {
			return {
				title: title,
				subtitle: [category, year].filter(Boolean).join(" • "),
				media: media,
			};
		},
	},
	orderings: [
		{
			title: "Order (Low to High)",
			name: "orderAsc",
			by: [
				{ field: "order", direction: "asc" },
				{ field: "_createdAt", direction: "desc" },
			],
		},
		{
			title: "Year (Newest First)",
			name: "yearDesc",
			by: [{ field: "year", direction: "desc" }],
		},
		{
			title: "Title (A-Z)",
			name: "titleAsc",
			by: [{ field: "title", direction: "asc" }],
		},
	],
});
