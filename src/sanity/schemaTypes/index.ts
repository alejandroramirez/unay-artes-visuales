import type { SchemaTypeDefinition } from "sanity";

import { artworkType } from "./artworkType";
import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [artworkType, categoryType, blockContentType],
};
