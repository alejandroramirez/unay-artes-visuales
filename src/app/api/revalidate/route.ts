import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { env } from "~/env";

type WebhookPayload = {
	_type: string;
	slug?: { current: string };
	category?: {
		_ref: string;
		slug?: { current: string };
	};
};

export async function POST(req: NextRequest) {
	try {
		const { body, isValidSignature } = await parseBody<WebhookPayload>(
			req,
			env.SANITY_REVALIDATE_SECRET,
		);

		// Verify webhook authenticity
		if (!isValidSignature) {
			console.error("Invalid webhook signature");
			return new Response("Invalid Signature", { status: 401 });
		}

		if (!body?._type) {
			console.error("Missing _type in webhook payload");
			return new Response("Bad Request", { status: 400 });
		}

		// Revalidate based on content type
		if (body._type === "artwork") {
			// Revalidate homepage (shows categories with sample images from artwork)
			revalidatePath("/");
			console.log("Revalidated homepage (artwork updated)");

			// Revalidate specific artwork page if slug provided
			if (body.slug?.current) {
				revalidatePath(`/obra/${body.slug.current}`);
				console.log(`Revalidated artwork page: /obra/${body.slug.current}`);
			}

			// Revalidate parent category page if available
			// Note: We need to get category slug from the webhook payload
			// This requires updating the Sanity webhook projection to include category info
			if (body.category?.slug?.current) {
				revalidatePath(`/categoria/${body.category.slug.current}`);
				console.log(
					`Revalidated category page: /categoria/${body.category.slug.current}`,
				);
			}

			console.log(`Artwork updated: ${body.slug?.current || "unknown"}`);
		} else if (body._type === "category") {
			// Revalidate homepage (shows categories)
			revalidatePath("/");
			console.log("Revalidated homepage (category list)");

			// Revalidate specific category page if slug provided
			if (body.slug?.current) {
				revalidatePath(`/categoria/${body.slug.current}`);
				console.log(
					`Revalidated category page: /categoria/${body.slug.current}`,
				);
			}

			console.log(`Category updated: ${body.slug?.current || "unknown"}`);
		}

		return NextResponse.json({
			status: 200,
			revalidated: true,
			now: Date.now(),
			type: body._type,
			slug: body.slug?.current,
		});
	} catch (error: unknown) {
		console.error("Webhook error:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return new Response(errorMessage, { status: 500 });
	}
}
