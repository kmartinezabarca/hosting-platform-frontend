import '../src/index.css';

/** @type {import('@storybook/react').Preview} */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f1115' },
      ],
    },
    layout: 'centered',
  },

  decorators: [
    (Story, context) => {
      // Aplicar clase dark cuando el fondo es oscuro
      const isDark = context.globals?.backgrounds?.value === '#0f1115';
      return (
        <div className={isDark ? 'dark' : ''} style={{ padding: '1rem' }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
