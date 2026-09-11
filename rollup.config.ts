// import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
// import terser from '@rollup/plugin-terser';
import type { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';

// const production = !process.env.ROLLUP_WATCH;

const backgroundConfig: RollupOptions = {
  input: 'src/background.ts',
  output: {
    sourcemap: true,
    format: 'esm',
    file: 'build/background.js',
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      include: [
        './src/background.ts',
        './src/browser.ts',
        './src/cache.ts',
        './src/configuration.ts',
        './src/linkding.ts',
      ],
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({ browser: true }),

    // production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

const bundleConfig: RollupOptions = {
  input: 'src/index.ts',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'linkding',
    file: 'build/bundle.js',
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      include: [
        './src/browser.ts',
        './src/cache.ts',
        './src/configuration.ts',
        './src/icons.ts',
        './src/linkding.ts',
        './src/options.ts',
        './src/popup-form.ts',
        './src/popup-intro.ts',
        './src/popup.ts',
        './src/profile.ts',
        './src/tag-autocomplete.ts',
        './src/util.ts',
      ],
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      browser: true,
    }),

    // production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

export default [backgroundConfig, bundleConfig];
