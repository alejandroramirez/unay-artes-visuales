import { Suspense } from "react";

/**
 * Template wrapper for artwork detail pages
 * Provides Suspense boundary for smooth transitions with animated skeleton
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
							<div className="lg:col-span-2">
								<div className="skeleton aspect-square w-full rounded" />
							</div>

							{/* Metadata skeleton */}
							<div className="flex flex-col lg:col-span-1">
								<div className="mb-8">
									<div className="skeleton mb-2 h-8 w-3/4 rounded" />
									<div className="skeleton h-6 w-1/2 rounded" />
								</div>

								<div className="space-y-3 border-t pt-6" style={{ borderColor: "#e5e5e5" }}>
									<div className="flex gap-4">
										<div className="skeleton h-4 w-24 rounded" />
										<div className="skeleton h-4 w-32 rounded" />
									</div>
									<div className="flex gap-4">
										<div className="skeleton h-4 w-24 rounded" />
										<div className="skeleton h-4 w-40 rounded" />
									</div>
									<div className="flex gap-4">
										<div className="skeleton h-4 w-24 rounded" />
										<div className="skeleton h-4 w-36 rounded" />
									</div>
									<div className="flex gap-4">
										<div className="skeleton h-4 w-24 rounded" />
										<div className="skeleton h-4 w-28 rounded" />
									</div>
								</div>

								<div className="mt-8 border-t pt-6" style={{ borderColor: "#e5e5e5" }}>
									<div className="space-y-2">
										<div className="skeleton h-4 w-full rounded" />
										<div className="skeleton h-4 w-full rounded" />
										<div className="skeleton h-4 w-3/4 rounded" />
									</div>
								</div>

								<div className="mt-8 border-t pt-6" style={{ borderColor: "#e5e5e5" }}>
									<div className="skeleton h-4 w-48 rounded" />
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
