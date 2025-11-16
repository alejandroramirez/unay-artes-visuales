/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
				pathname: "/**",
			},
		],
	},
	// Exclude server-only dependencies from client bundle
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.alias = {
				...config.resolve.alias,
				puppeteer: false,
				"@sparticuz/chromium": false,
			};
		}
		return config;
	},
};

export default config;
