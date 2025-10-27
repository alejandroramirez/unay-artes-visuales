import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
				<h1 className="font-extrabold text-5xl text-white tracking-tight sm:text-[5rem]">
					Unay <span className="text-[hsl(280,100%,70%)]">Artes Visuales</span>
				</h1>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
					<Link
						className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
						href="/studio"
					>
						<h3 className="font-bold text-2xl">Sanity Studio →</h3>
						<div className="text-lg">
							Accede al sistema de gestión de contenido para crear y administrar
							tus obras de arte.
						</div>
					</Link>
					<a
						className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
						href="https://www.sanity.io/docs"
						target="_blank"
						rel="noopener noreferrer"
					>
						<h3 className="font-bold text-2xl">Documentación →</h3>
						<div className="text-lg">
							Aprende más sobre Sanity CMS y cómo construir experiencias de
							contenido poderosas.
						</div>
					</a>
				</div>
			</div>
		</main>
	);
}
