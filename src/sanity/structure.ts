import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
	S.list()
		.title("Blog")
		.items([
			S.documentTypeListItem("post").title("Posts"),
			S.documentTypeListItem("category").title("Categories"),
			S.documentTypeListItem("author").title("Authors"),
			S.divider(),
			...S.documentTypeListItems().filter((item) => {
				const id = item.getId();
				return id !== undefined && !["post", "category", "author"].includes(id);
			}),
		]);
