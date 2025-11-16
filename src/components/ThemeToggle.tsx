"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Theme Toggle Component
 * Simple button to cycle through light, dark, and system themes
 */
export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<button
				type="button"
				className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
				aria-label="Cambiar tema"
			>
				<div className="h-5 w-5" />
			</button>
		);
	}

	const cycleTheme = () => {
		if (theme === "light") {
			setTheme("dark");
		} else if (theme === "dark") {
			setTheme("system");
		} else {
			setTheme("light");
		}
	};

	const getIcon = () => {
		if (theme === "light") {
			// Sun icon
			return (
				<svg
					className="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<title>Modo claro</title>
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
				</svg>
			);
		}
		if (theme === "dark") {
			// Moon icon
			return (
				<svg
					className="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<title>Modo oscuro</title>
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			);
		}
		// System/Monitor icon
		return (
			<svg
				className="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<title>Modo sistema</title>
				<rect x="2" y="3" width="20" height="14" rx="2" />
				<path d="M8 21h8m-4-4v4" />
			</svg>
		);
	};

	return (
		<button
			type="button"
			onClick={cycleTheme}
			className="rounded-lg p-2 text-foreground transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
			aria-label={`Cambiar tema (actual: ${theme === "light" ? "claro" : theme === "dark" ? "oscuro" : "sistema"})`}
		>
			{getIcon()}
		</button>
	);
}
