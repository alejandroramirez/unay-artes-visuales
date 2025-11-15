import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
	S.list()
		.title("Content")
		.items([
			// Artwork - Orderable list with drag-and-drop
			orderableDocumentListDeskItem({
				type: "artwork",
				title: "Artwork",
				S,
				context,
			}),
			// Divider for visual separation
			S.divider(),
			// Categories - Orderable list with drag-and-drop
			orderableDocumentListDeskItem({
				type: "category",
				title: "Categories",
				S,
				context,
			}),
		]);
