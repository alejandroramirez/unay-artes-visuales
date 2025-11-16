# Data Transformation & Import

This directory contains transformed artwork data ready for import into Sanity CMS.

## Overview

The data transformation process converts Excel spreadsheets (like `FICHAS_TECNICAS.xlsx`) into Sanity-compatible formats. The script is designed to be reusable - whenever you receive a new Excel file with the same structure, you can run it again to generate updated import files.

## Quick Start

1. **Place your Excel file** in the project root (e.g., `FICHAS_TECNICAS.xlsx`)

2. **Run the transformation script:**
   ```bash
   pnpm transform:data
   ```

   Or specify custom input/output:
   ```bash
   pnpm transform:data path/to/input.xlsx path/to/output/
   ```

3. **Review the generated files** in the `data/` directory

4. **Import into Sanity** (see Import Instructions below)

## Generated Files

After running the transformation, you'll find:

- **`artworks.json`** - JSON array of all artworks (easiest to review)
- **`artworks.ndjson`** - Newline-delimited JSON (for bulk imports)
- **`artworks.csv`** - CSV format (for spreadsheet viewing)
- **`categories.json`** - List of unique categories to create in Sanity
- **`apartados.json`** - List of unique apartado values found
- **`data-quality-issues.json`** - Data validation issues (if any)

## Data Mapping

The script transforms Excel columns to Sanity fields as follows:

| Excel Column | Sanity Field | Transformation |
|--------------|--------------|----------------|
| APARTADO | `apartado` | Normalized to title case (Pintura, Fotografía, Gráfica) |
| PRACTICA | `category` | Normalized to title case, will reference category documents |
| ALUMNO | `autor` | Direct mapping |
| NOMBRE_OBRA | `title` | Direct mapping (entries with "NO" are filtered out) |
| MEDIDAS | `dimensions` | Formatted to "X x Y cm" format (preserves 6x4 and word dimensions) |
| TECNICA | `medium` | Direct mapping |
| Columna1 | `notes` | Optional notes field |

**Filtering:** Only entries where `¿PARTICIPAS? SI/NO` is "SI" are included.

## Dimension Formatting Rules

The script automatically formats dimensions to a consistent format:

- Numeric dimensions: Converted to "X x Y cm" (e.g., "80x61" → "80 x 61 cm")
- Photo sizes: "6x4" preserved as-is
- Word dimensions: "Media Carta" preserved as-is
- Already formatted: Cleaned up spacing (e.g., "50 x 35 cm" → "50 x 35 cm")

## Import Instructions

### Step 1: Create Categories First

Before importing artworks, you need to create category documents in Sanity:

1. Review `categories.json` to see all unique categories
2. In Sanity Studio (`/studio`), create each category manually or use the Sanity CLI:

```bash
# Example: Import categories using Sanity CLI
sanity dataset import data/categories.json production --replace
```

### Step 2: Import Artworks

**Important:** Artworks require images, which are NOT included in the Excel file. You have two options:

#### Option A: Manual Upload (Recommended for non-technical users)

1. Open Sanity Studio (`http://localhost:3000/studio` or your deployed URL)
2. Go to the "Artworks" section
3. For each artwork in `artworks.json`:
   - Create a new artwork document
   - Fill in the fields from the JSON data
   - Upload the corresponding image
   - Set the image alt text

#### Option B: Bulk Import with Placeholder Images

If you want to import the data structure first and add images later:

1. Modify the transformation script to add placeholder image references
2. Use the Sanity CLI to bulk import:

```bash
sanity dataset import data/artworks.ndjson production
```

3. Manually upload images later through Sanity Studio

### Step 3: Verify Data Quality

Review `data-quality-issues.json` (if it exists) to identify any data problems:

- Missing or invalid titles
- Unknown apartado values
- Other validation issues

Address these issues before or during the import process.

## Apartado Values

The three main classifications (apartados) are:

- **Pintura** - Paintings
- **Fotografía** - Photography
- **Gráfica** - Graphic arts

These values are validated against the Sanity schema dropdown options.

## Re-running the Transformation

The transformation script is designed to be **idempotent** - you can run it multiple times safely. Each run will:

1. Read the Excel file fresh
2. Apply all transformations
3. Overwrite the files in the `data/` directory

This makes it easy to:
- Fix issues in the Excel file and re-transform
- Process updated Excel files with new data
- Adjust transformation logic and regenerate

## Troubleshooting

### "File not found" error

Make sure your Excel file is in the project root, or provide the correct path:
```bash
pnpm transform:data path/to/your/file.xlsx
```

### Data quality issues

Review `data-quality-issues.json` to see which rows have problems. Common issues:
- Missing artwork titles (NOMBRE_OBRA)
- Invalid apartado values
- Malformed data

### Import failures

If bulk import fails:
1. Ensure categories exist before importing artworks
2. Check that all required fields are present
3. Verify image references are valid
4. Review Sanity schema requirements (title, slug, image are required)

## Next Steps

After successful import:

1. **Add Images**: Upload artwork images through Sanity Studio
2. **Review Data**: Check that all fields imported correctly
3. **Test Frontend**: Verify artworks display properly on the website
4. **Organize**: Use drag-and-drop ordering in Sanity Studio to arrange artworks

## Need Help?

- Check the transformation script: `scripts/transform-excel-data.ts`
- Review Sanity schema: `src/sanity/schemaTypes/artworkType.ts`
- Consult the main project README: `CLAUDE.md`
