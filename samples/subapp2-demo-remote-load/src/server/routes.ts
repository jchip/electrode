import { home } from "../app";
import { PageRenderer } from "@xarc/react";
import { ElectrodeFastifyInstance } from "@xarc/fastify-server";
import Fs from "fs";

/**
 * Fastify plugin to setup application routes
 *
 * @param server - fastify server, should not have started yet
 * @returns nothing
 */
export async function fastifyPlugin(server: ElectrodeFastifyInstance) {
  const loadJs = Fs.readFileSync(require.resolve("loadjs/dist/loadjs.min.js"), "utf8");
  const homeRenderer: PageRenderer = new PageRenderer({
    pageTitle: "xarc React App demo",
    templateInserts: {
      head: {
        contextReady: [(context) => `<script${context.user.scriptNonceAttr}>${loadJs}</script>`],
      },
    },
    subApps: [{ name: home.name, ssr: true }],
    prodAssetData: {
      cdnMap: "config/assets.json",
    },
  });

  server.route({
    method: "GET",
    url: "/",
    async handler(request, reply) {
      try {
        const context = await homeRenderer.render({ request });
        reply.type("text/html");

        if (context.user.cspHeader) {
          reply.header(`content-security-policy`, context.user.cspHeader);
        }

        reply.send(context.result);
      } catch (error) {
        reply.send(error.stack);
      }
    },
  });
}
