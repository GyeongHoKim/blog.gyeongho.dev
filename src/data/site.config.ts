interface SiteConfig {
	author: string
	title: string
	description: string
	lang: string
	ogLocale: string
	shareMessage: string
	paginationSize: number
}

export const siteConfig: SiteConfig = {
	author: 'GyeongHo', // Site author
	title: 'GyeongHo Blog', // Site title.
	description: "Let's dive into GyeongHo", // Description to display in the meta tags
	lang: 'ko-KR',
	ogLocale: 'ko_KR',
	shareMessage: 'Share this post', // Message to share a post on social media
	paginationSize: 6 // Number of posts per page
}
