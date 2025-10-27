import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
	S.list()
		.title("Content")
		.items([
			// Artwork - Main content type with image preview
			S.listItem()
				.title("Artwork")
				.schemaType("artwork")
				.child(
					S.documentTypeList("artwork")
						.title("Artwork")
						.defaultOrdering([
							{ field: "order", direction: "asc" },
							{ field: "_createdAt", direction: "desc" },
						]),
				),
			// Divider for visual separation
			S.divider(),
			// Categories for organizing artwork
			S.documentTypeListItem("category").title("Categories"),
		]);
