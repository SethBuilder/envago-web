/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "envago-web",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: { region: "sa-east-1" },
      },
    };
  },
  async run() {
    new sst.aws.Nextjs("EnvagoWeb", {
      environment: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        NEXT_PUBLIC_COMING_SOON: process.env.NEXT_PUBLIC_COMING_SOON ?? "false",
      },
      domain: {
        name: "envago.live",
        redirects: ["www.envago.live"],
      },
    });
  },
});
