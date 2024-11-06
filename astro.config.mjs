import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import { remarkReadingTime } from '@/utils'

export default defineConfig({
	// Write here your website url
	site: 'https://blog.gyeongho.dev/',

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

	vite: {
		resolve: {
			alias: {
				'@/components/*': ['src/components/*.astro'],
				'@/layouts/*': ['src/layouts/*.astro'],
				'@/utils': ['src/utils/index.ts'],
				'@/data/*': ['src/data/*'],
				'@/site-config': ['src/data/site.config.ts'],
				'@/styles': ['src/styles/']
			}
		}
	}
})
