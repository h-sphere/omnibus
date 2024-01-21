import { defineConfig } from 'vitepress'
import { transformerTwoslash } from 'vitepress-plugin-twoslash' 

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Omnibus",
  description: "Event Bus TypeScript Library",
  base: '/omnibus/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/quick-start' }
    ],

    sidebar: [
      {
        text: 'Quick Start',
        items: [
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/h-sphere/omnibus' }
    ]
  },
  markdown: {
    codeTransformers: [
      transformerTwoslash() 
    ]
  }
})
