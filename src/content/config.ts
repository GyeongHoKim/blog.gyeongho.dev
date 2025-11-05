import { defineCollection, z } from 'astro:content'
import { CATEGORIES } from '@/data/categories'

const blogSchema = {
	schema: ({ image }) =>
		z.object({
			title: z.string().max(80),
			description: z.string(),
			pubDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			heroImage: image(),
			category: z.enum(CATEGORIES),
			tags: z.array(z.string()),
			draft: z.boolean().default(false),
			lang: z.enum(['ko', 'en', 'ja']).default('ko')
		})
}

const blog = defineCollection(blogSchema)

export const collections = { blog }
