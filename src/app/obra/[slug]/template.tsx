import { Suspense } from "react";

/**
 * Template wrapper for artwork detail pages
 * Provides Suspense boundary for smooth transitions
 */
export default function ArtworkTemplate({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-white">
					<div className="container mx-auto px-3 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
						<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3 lg:gap-16">
							{/* Image skeleton */}
							<div className="animate-pulse lg:col-span-2">
								<div className="aspect-square w-full rounded bg-neutral-200" />
							</div>

							{/* Metadata skeleton */}
							<div className="flex flex-col lg:col-span-1">
								<div className="mb-8 animate-pulse">
									<div className="mb-2 h-8 w-3/4 rounded bg-neutral-200" />
									<div className="h-6 w-1/2 rounded bg-neutral-100" />
								</div>

								<div className="space-y-3 border-t pt-6 animate-pulse">
									<div className="flex gap-4">
										<div className="h-4 w-24 rounded bg-neutral-100" />
										<div className="h-4 w-32 rounded bg-neutral-200" />
									</div>
									<div className="flex gap-4">
										<div className="h-4 w-24 rounded bg-neutral-100" />
										<div className="h-4 w-40 rounded bg-neutral-200" />
									</div>
									<div className="flex gap-4">
										<div className="h-4 w-24 rounded bg-neutral-100" />
										<div className="h-4 w-36 rounded bg-neutral-200" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			}
		>
			{children}
		</Suspense>
	);
}
