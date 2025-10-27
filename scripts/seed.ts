/**
 * Seed script to populate Sanity with mock artwork data
 * Run with: pnpm seed
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "",
	apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-08",
	token: process.env.SANITY_API_TOKEN,
	useCdn: false,
});

// Mock categories
const categories = [
	{
		_type: "category",
		title: "Grabados",
		slug: { current: "grabados" },
		description: "Obras creadas mediante técnicas de grabado",
		order: 1,
	},
	{
		_type: "category",
		title: "Pinturas",
		slug: { current: "pinturas" },
		description: "Pinturas en diversos medios",
		order: 2,
	},
	{
		_type: "category",
		title: "Arte Digital",
		slug: { current: "arte-digital" },
		description: "Obras creadas digitalmente",
		order: 3,
	},
];

// Function to create a colored placeholder image in Sanity
async function createPlaceholderImage(
	color: string,
	name: string,
): Promise<{ _type: string; asset: { _type: string; _ref: string } }> {
	// Create a simple SVG placeholder
	const svg = `
		<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
			<rect width="800" height="1000" fill="${color}"/>
			<text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">
				${name}
			</text>
		</svg>
	`;

	const buffer = Buffer.from(svg);

	// Upload to Sanity
	const asset = await client.assets.upload("image", buffer, {
		filename: `${name.toLowerCase().replace(/\s+/g, "-")}.svg`,
	});

	return {
		_type: "image",
		asset: {
			_type: "reference",
			_ref: asset._id,
		},
	};
}

// Mock artworks
async function createMockArtworks(categoryIds: Record<string, string>) {
	const colors = [
		"#8B4513",
		"#2E4057",
		"#8B0000",
		"#2F4F4F",
		"#4B0082",
		"#556B2F",
		"#8B4789",
		"#CD853F",
	];

	const artworks = [
		{
			title: "Amanecer en las Montañas",
			autor: "Ana García Mendoza",
			category: categoryIds.pinturas,
			year: "2024",
			dimensions: "60 x 80 cm",
			medium: "Óleo sobre lienzo",
			order: 1,
			color: colors[0],
		},
		{
			title: "Geometría Urbana",
			autor: "Carlos Martínez",
			category: categoryIds.grabados,
			year: "2023",
			dimensions: "40 x 50 cm",
			medium: "Grabado en linóleo",
			order: 2,
			color: colors[1],
		},
		{
			title: "Reflejos",
			autor: "María Fernández",
			category: categoryIds.pinturas,
			year: "2024",
			dimensions: "70 x 90 cm",
			medium: "Acrílico sobre madera",
			order: 3,
			color: colors[2],
		},
		{
			title: "Memoria del Agua",
			autor: "Ana García Mendoza",
			category: categoryIds.grabados,
			year: "2023",
			dimensions: "30 x 40 cm",
			medium: "Aguafuerte",
			order: 4,
			color: colors[3],
		},
		{
			title: "Paisaje Fragmentado",
			autor: "Diego Ramírez",
			category: categoryIds["arte-digital"],
			year: "2024",
			dimensions: "Dimensiones variables",
			medium: "Arte digital",
			order: 5,
			color: colors[4],
		},
		{
			title: "Naturaleza Abstracta",
			autor: "María Fernández",
			category: categoryIds.pinturas,
			year: "2023",
			dimensions: "50 x 70 cm",
			medium: "Óleo sobre lienzo",
			order: 6,
			color: colors[5],
		},
		{
			title: "Serie Texturas III",
			autor: "Carlos Martínez",
			category: categoryIds.grabados,
			year: "2024",
			dimensions: "35 x 45 cm",
			medium: "Xilografía",
			order: 7,
			color: colors[6],
		},
		{
			title: "Composición en Azul",
			autor: "Diego Ramírez",
			category: categoryIds["arte-digital"],
			year: "2024",
			dimensions: "100 x 150 cm (impresión)",
			medium: "Impresión digital sobre papel de algodón",
			order: 8,
			color: colors[7],
		},
	];

	const descriptions = [
		"Una exploración de los contrastes entre luz y sombra, capturando el momento exacto en que el día comienza.",
		"Inspirada en las líneas y formas de la arquitectura moderna, esta obra juega con la percepción del espacio.",
		"Una meditación visual sobre la naturaleza efímera de las imágenes reflejadas en superficies acuáticas.",
		"Parte de una serie que explora la memoria y el paso del tiempo a través de texturas orgánicas.",
		"Una reinterpretación digital de paisajes tradicionales, fragmentados y reconstruidos en capas.",
		"Abstracción inspirada en formas naturales, buscando la esencia más allá de la representación literal.",
		"Tercera pieza de una serie que investiga las posibilidades expresivas de la textura en el grabado.",
		"Composición minimalista que explora las posibilidades del color digital y la impresión de alta calidad.",
	];

	console.log("\n🎨 Creating artwork with placeholder images...");

	for (let i = 0; i < artworks.length; i++) {
		const artwork = artworks[i];
		if (!artwork) continue;

		console.log(`   Creating: ${artwork.title}...`);

		// Create placeholder image
		const image = await createPlaceholderImage(
			artwork.color || "#999999",
			artwork.title,
		);

		// Create artwork document
		await client.create({
			_type: "artwork",
			title: artwork.title,
			slug: {
				current: artwork.title
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-|-$/g, ""),
			},
			image: {
				...image,
				alt: `Obra de arte: ${artwork.title}`,
			},
			description: [
				{
					_type: "block",
					style: "normal",
					children: [
						{
							_type: "span",
							text: descriptions[i],
						},
					],
				},
			],
			autor: artwork.autor,
			category: {
				_type: "reference",
				_ref: artwork.category,
			},
			year: artwork.year,
			dimensions: artwork.dimensions,
			medium: artwork.medium,
			order: artwork.order,
		});

		console.log(`   ✓ Created: ${artwork.title}`);
	}
}

async function seed() {
	console.log("🌱 Starting seed process...");

	try {
		// Check if token exists
		if (!process.env.SANITY_API_TOKEN) {
			console.error("\n❌ Error: SANITY_API_TOKEN not found in environment");
			console.log(
				"\nTo get a token:\n1. Go to https://www.sanity.io/manage\n2. Select your project\n3. Go to API → Tokens\n4. Create a token with 'Editor' permissions\n5. Add it to .env.local: SANITY_API_TOKEN=your_token_here\n",
			);
			process.exit(1);
		}

		// Create categories
		console.log("\n📁 Creating categories...");
		const categoryIds: Record<string, string> = {};

		for (const category of categories) {
			const created = await client.create(category);
			categoryIds[category.slug.current] = created._id;
			console.log(`   ✓ Created: ${category.title}`);
		}

		// Create artworks with placeholder images
		await createMockArtworks(categoryIds);

		console.log("\n✅ Seed completed successfully!");
		console.log(
			"\n🎉 Your gallery is now populated with mock data. Visit http://localhost:3000 to see it!\n",
		);
	} catch (error) {
		console.error("\n❌ Error during seeding:", error);
		process.exit(1);
	}
}

seed();
