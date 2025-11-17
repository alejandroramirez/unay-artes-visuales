import { ImageIcon } from "@sanity/icons";
import {
	orderRankField,
	orderRankOrdering,
} from "@sanity/orderable-document-list";
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
			name: "apartado",
			title: "Apartado",
			type: "string",
			description: "Main classification of the artwork",
			options: {
				list: [
					{ title: "Pintura", value: "Pintura" },
					{ title: "Fotografía", value: "Fotografía" },
					{ title: "Gráfica", value: "Gráfica" },
				],
				layout: "dropdown",
			},
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
		// orderRank field for drag-and-drop ordering (auto-generates initial values)
		orderRankField({ type: "artwork" }),
	],
	preview: {
		select: {
			title: "title",
			media: "image",
			category: "category.title",
			apartado: "apartado",
			year: "year",
		},
		prepare({ title, media, category, apartado, year }) {
			return {
				title: title,
				subtitle: [apartado, category, year].filter(Boolean).join(" • "),
				media: media,
			};
		},
	},
	orderings: [
		// Default drag-and-drop ordering
		orderRankOrdering,
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
