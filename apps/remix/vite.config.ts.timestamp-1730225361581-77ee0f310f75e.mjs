// vite.config.ts
import {vitePlugin as remix} from 'file:///Users/pedrobonamin/code/visual-editing/node_modules/.pnpm/@remix-run+dev@2.13.1_@remix-run+react@2.13.1_react-dom@18.3.1_react@18.3.1__react@18.3.1_typ_5vrzqnrpu55v652wd4525qac4m/node_modules/@remix-run/dev/dist/index.js'
import {installGlobals} from 'file:///Users/pedrobonamin/code/visual-editing/node_modules/.pnpm/@remix-run+node@2.13.1_typescript@5.6.3/node_modules/@remix-run/node/dist/index.js'
import {vercelPreset} from 'file:///Users/pedrobonamin/code/visual-editing/node_modules/.pnpm/@vercel+remix@2.13.1_@remix-run+dev@2.13.1_@remix-run+react@2.13.1_react-dom@18.3.1_react@18._yeg3fl5rxampokkqnqm25xlxzi/node_modules/@vercel/remix/vite.js'
import tsconfigPaths from 'file:///Users/pedrobonamin/code/visual-editing/node_modules/.pnpm/vite-tsconfig-paths@5.0.1_typescript@5.6.3_vite@5.4.10_@types+node@22.5.5_terser@5.33.0_/node_modules/vite-tsconfig-paths/dist/index.js'
import {defineConfig} from 'file:///Users/pedrobonamin/code/visual-editing/node_modules/.pnpm/vite@5.4.10_@types+node@22.5.5_terser@5.33.0/node_modules/vite/dist/node/index.js'

installGlobals()
var vite_config_default = defineConfig({
  server: {
    port: 3e3,
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
})
export {vite_config_default as default}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcGVkcm9ib25hbWluL2NvZGUvdmlzdWFsLWVkaXRpbmcvYXBwcy9yZW1peFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3BlZHJvYm9uYW1pbi9jb2RlL3Zpc3VhbC1lZGl0aW5nL2FwcHMvcmVtaXgvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3BlZHJvYm9uYW1pbi9jb2RlL3Zpc3VhbC1lZGl0aW5nL2FwcHMvcmVtaXgvdml0ZS5jb25maWcudHNcIjtpbXBvcnQge3ZpdGVQbHVnaW4gYXMgcmVtaXh9IGZyb20gJ0ByZW1peC1ydW4vZGV2J1xuaW1wb3J0IHtpbnN0YWxsR2xvYmFsc30gZnJvbSAnQHJlbWl4LXJ1bi9ub2RlJ1xuaW1wb3J0IHt2ZXJjZWxQcmVzZXR9IGZyb20gJ0B2ZXJjZWwvcmVtaXgvdml0ZSdcbmltcG9ydCB7ZGVmaW5lQ29uZmlnfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocydcblxuaW5zdGFsbEdsb2JhbHMoKVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVtaXgoe1xuICAgICAgcHJlc2V0czogW3ZlcmNlbFByZXNldCgpXSxcbiAgICB9KSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gIF0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VSxTQUFRLGNBQWMsYUFBWTtBQUMxVyxTQUFRLHNCQUFxQjtBQUM3QixTQUFRLG9CQUFtQjtBQUMzQixTQUFRLG9CQUFtQjtBQUMzQixPQUFPLG1CQUFtQjtBQUUxQixlQUFlO0FBRWYsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFBQSxJQUMxQixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsRUFDaEI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
