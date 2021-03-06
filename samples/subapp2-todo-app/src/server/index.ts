import { PageRenderer } from "@xarc/react";
import { loadRuntimeSupport } from "@xarc/app";
import electrodeServer from "@xarc/fastify-server";
import { config } from "./config";
import { Todo } from "../app";

async function start() {
  await loadRuntimeSupport({
    isomorphicCdnOptions: {
      prodOnly: true
    }
  });
  const server = await electrodeServer(config);

  let homeRenderer: PageRenderer;

  server.route({
    method: "GET",
    path: "/",
    async handler(request, reply) {
      try {
        if (!homeRenderer) {
          homeRenderer = new PageRenderer({
            pageTitle: "Electrode X Redux ToDo demo",
            subApps: [
              // { name: home.name, ssr: true },
              // { name: Demo2.name, ssr: true }
              { name: Todo.name, ssr: false }
            ],
            prodAssetData: {
              cdnMap: "config/assets.json"
            }
          });
        }
        const context = await homeRenderer.render({ request });
        reply.type("text/html");

        if (context.user.cspHeader) {
          reply.header(`content-security-policy`, context.user.cspHeader);
        }

        reply.send(context.result);
      } catch (error) {
        reply.send(error.stack);
      }
    }
  });

  server.start();
  return server;
}

start();
