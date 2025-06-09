export const DEFAULT_PROJECT_CONFIG = {
  nextjs: {
    version: "14.2.3",
    typescript: true,
    tailwind: true,
    appRouter: true
  },
  modules: {
    defaultLayout: true,
    navigation: true
  }
} as const;
