import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import { remarkReadingTime } from './src/utils/readTime.ts'

import vercel from '@astrojs/vercel/serverless'

export default defineConfig({
	// Write here your website url
	site: 'https://blog-template-gray.vercel.app/',

	markdown: {
		remarkPlugins: [remarkReadingTime],
		drafts: true,
		shikiConfig: {
			theme: 'material-theme-palenight',
			wrap: true
		}
	},

	integrations: [
		mdx({
			syntaxHighlight: 'shiki',
			shikiConfig: {
				experimentalThemes: {
					light: 'vitesse-light',
					dark: 'material-theme-palenight'
				},
				wrap: true
			},
			drafts: true
		}),
		sitemap(),
		tailwind(),
		react()
	],

	output: 'server',
	adapter: vercel()
})
