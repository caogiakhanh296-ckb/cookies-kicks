tailwind.config = {
  theme: {
    extend: {
      colors: {

        white: '#FFFFFF',
        adidas: '#EBEEEF',
        nike: '#F5F5F5',
        black: '#000000',
        pitch: '#000000',
        charcoal: '#111111',
        accent: '#FA5400',
        sale: '#FA5400',
        out: '#FA5400',
        instock: '#008A00',

        muted: '#707072',
        line: '#E5E5E5',
        brand: '#000000',
        ink: '#111111',
        navy: '#111111',
        tile: '#EBEEEF',
        sky: '#F5F5F5',
        grayui: '#F5F5F5',
        ice: '#D4D7D9',
      },
      fontFamily: {

        heading: ['Oswald', 'Anton', '"Bebas Neue"', 'sans-serif'],
        cond: ['Oswald', 'Anton', '"Bebas Neue"', 'sans-serif'],
        sans: ['Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Inter', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        heading: '-0.02em',
        tech: '0.04em',
        wide: '0.1em',
      },
      lineHeight: {
        heading: '0.95',
      },

      gap: {
        'grid-sm': '8px',
        'grid-lg': '16px',
      },
      aspectRatio: {
        shoe: '1 / 1',
        'shoe-4x5': '4 / 5',
      },
      maxWidth: {
        site: '1440px',
      },
    },
  },
};
