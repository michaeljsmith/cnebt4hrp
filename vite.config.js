import { defineConfig } from 'vite'
import resolve from '@rollup/plugin-node-resolve'

export default defineConfig({
  // Vite doesn't support the Typescript behaviour where the code imports
  // the .js file which implicitly loads the .ts file (yes, it's strange),
  // see https://github.com/microsoft/TypeScript/issues/16577.
  //
  // This workaround was suggested on
  // https://github.com/vitejs/vite/issues/3040.
  plugins: [resolve({
    extensions: ['.js', '.ts']
  })]
})
