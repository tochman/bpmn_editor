/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile bpmn-js packages for proper ESM handling
  transpilePackages: [
    'bpmn-js',
    'bpmn-js-properties-panel',
    '@bpmn-io/properties-panel',
    'bpmn-js-color-picker',
    'diagram-js'
  ],
  webpack: (config) => {
    // Handle .bpmn files as raw text
    config.module.rules.push({
      test: /\.bpmn$/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;
