import { Suspense } from "react";

/**
 * Template wrapper for category pages
 * Provides Suspense boundary for smooth transitions with animated skeleton
 */
export default function CategoryTemplate({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-white">
					<div className="container mx-auto px-3 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
						{/* Header skeleton */}
						<div className="mb-12">
							<div className="skeleton mb-3 h-8 w-64 rounded" />
							<div className="skeleton mb-4 h-6 w-48 rounded" />
							<div className="skeleton h-4 w-32 rounded" />
						</div>

						{/* Artwork grid skeleton */}
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3 lg:gap-16 xl:grid-cols-4">
							{Array.from({ length: 8 }).map((_, i) => (
								<div key={i}>
									<div className="skeleton aspect-square w-full rounded" />
									<div className="pt-3">
										<div className="skeleton mb-2 h-4 w-3/4 rounded" />
										<div className="skeleton h-3 w-1/2 rounded" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			}
		>
			{children}
		</Suspense>
	);
}
