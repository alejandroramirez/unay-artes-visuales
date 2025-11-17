import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

/**
 * Manual revalidation endpoint
 * Use this for triggering revalidation manually (e.g., after bulk updates)
 *
 * Usage:
 * GET /api/revalidate-manual?secret=YOUR_SECRET&path=/
 */
export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams;
		const secret = searchParams.get("secret");
		const path = searchParams.get("path") || "/";

		// Verify secret
		if (secret !== env.SANITY_REVALIDATE_SECRET) {
			return new Response("Invalid secret", { status: 401 });
		}

		// Revalidate the requested path
		revalidatePath(path);
		console.log(`✅ Manually revalidated: ${path}`);

		return NextResponse.json({
			revalidated: true,
			path,
			now: Date.now(),
		});
	} catch (error: unknown) {
		console.error("Manual revalidation error:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return new Response(errorMessage, { status: 500 });
	}
}
