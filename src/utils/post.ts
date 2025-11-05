import { getCollection } from 'astro:content'

export const getCategories = async (lang: string = 'ko') => {
	const posts = await getCollection('blog', ({ data }) => {
		return data.lang === lang
	})
	const categories = new Set(
		posts.filter((post) => !post.data.draft).map((post) => post.data.category)
	)
	return Array.from(categories)
}

export const getPosts = async (max?: number, lang: string = 'ko') => {
	return (
		await getCollection('blog', ({ data }) => {
			return data.lang === lang
		})
	)
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		.slice(0, max)
}

export const getTags = async (lang: string = 'ko') => {
	const posts = await getCollection('blog', ({ data }) => {
		return data.lang === lang
	})
	const tags = new Set()
	posts
		.filter((post) => !post.data.draft)
		.forEach((post) => {
			post.data.tags.forEach((tag) => {
				tags.add(tag.toLowerCase())
			})
		})

	return Array.from(tags)
}

export const getPostByTag = async (tag: string, lang: string = 'ko') => {
	const posts = await getPosts(undefined, lang)
	const lowercaseTag = tag.toLowerCase()
	return posts
		.filter((post) => !post.data.draft)
		.filter((post) => {
			return post.data.tags.some((postTag) => postTag.toLowerCase() === lowercaseTag)
		})
}

export const filterPostsByCategory = async (category: string, lang: string = 'ko') => {
	const posts = await getPosts(undefined, lang)
	return posts
		.filter((post) => !post.data.draft)
		.filter((post) => post.data.category.toLowerCase() === category)
}
