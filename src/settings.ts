export const profile = {
	fullName: 'Elio Ramos Colón',
	title: '',
	institute: 'Universidad de Puerto Rico en Humacao',
	author_name: '', // Author name to be highlighted in the papers section
	research_areas: [
		// { title: 'Physics', description: 'Brief description of the research interest', field: 'physics' },
	],
}

// Set equal to an empty string to hide the icon that you don't want to display
export const social = {
	email: 'elio.ramos@upr.edu',
	linkedin: 'https://www.linkedin.com/in/elio-ramos-col%C3%B3n-b7309b123/',
	x: '',
	github: 'https://github.com/elioramosweb?tab=repositories',
	gitlab: '',
	scholar: '',
	inspire: '',
	arxiv: '',
}

export const template = {
	website_url: 'https://localhost:4321', // Astro needs to know your site’s deployed URL to generate a sitemap. It must start with http:// or https://
	menu_left: false,
	transitions: true,
	lightTheme: 'light', // Select one of the Daisy UI Themes or create your own
	darkTheme: 'dark', // Select one of the Daisy UI Themes or create your own
	excerptLength: 200,
	postPerPage: 5,
    base: '' // Repository name starting with /
}

export const seo = {
	default_title: '',
	default_description: 'Astro Academia is a template for academic websites.',
	default_image: '/images/caleidoscopio3.png',
}
