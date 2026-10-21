module.exports = {
  forbidden: [
    {
      name: "rotas-so-conhecem-controllers",
      comment:
        "Uma rota roteia. Se ela importa service ou banco, a fronteira Route/Controller vazou.",
      severity: "error",
      from: { path: "^src/routes" },
      to: { path: "^src/(services|repositories|database)" },
    },
    {
      name: "controllers-nao-tocam-o-banco",
      comment:
        "Controller traduz HTTP <-> domínio. Acesso a dados é papel do service/repository.",
      severity: "error",
      from: { path: "^src/controllers" },
      to: { path: "^src/(database|repositories)|^node_modules/(better-sqlite3|@prisma)" },
    },
    {
      name: "services-nao-conhecem-a-web",
      comment:
        "Service não conhece Express, Multer, controllers, routes ou middlewares.",
      severity: "error",
      from: { path: "^src/services" },
      to: { path: "^src/(controllers|routes|middlewares)|^node_modules/(express|multer)" },
    },
    {
      name: "so-repositories-importam-o-driver",
      comment:
        "A persistência é um adapter: fora de repositories ninguém importa database nem Prisma.",
      severity: "error",
      from: { path: "^src/(?!repositories)" },
      to: { path: "^src/database$|^node_modules/@prisma/client" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};
