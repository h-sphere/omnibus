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
        text: 'Guide',
        items: [
          { text: 'Quick Start', link: '/quick-start' },
          {
            text: 'Overview',
            items: [
              { text: 'Basics', link: '/basics' },
              { text: 'Installation', link: '/installation' },
              { text: 'Registering Events', link: '/registering-events' },
              { text: 'Triggering Events', link: '/triggering-events' },
              { text: 'Listening to Events', link: '/listening-to-events' },
              { text: 'Using Registrator', link: '/using-registrator' },
              { text: 'Creating Events from Other Buses', link: '/creating-events-from-other-buses' },
              { text: 'Listening once', link: '/listening-once' }

            ]
          },
          {
            text: 'Examples',
            items: [
              { text: 'Logger', link: '/examples/logger', docFooterText: 'Examples: Logger' },
              { text: 'MIDIVal', link: '/examples/midival', docFooterText: 'Examples: MIDIVal' }
            ]
          }
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
