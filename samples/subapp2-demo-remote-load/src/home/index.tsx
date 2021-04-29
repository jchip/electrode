import { React, ReactSubApp, createDynamicComponent, staticPropsFeature } from "@xarc/react";
import electrodePng from "../../static/electrode.png";
import { message } from "./message";

async function loadRemoteModule(scope, module) {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__("default");

  const container = window[scope]; // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);
  console.log("inited remote container", scope, "loading module", module);
  const factory = await window[scope].get(module, scope);
  const Module = factory();
  return Module;
}

function testLoadRemoteModule(scope, module) {
  return new Promise((resolve) => {
    if (window[scope]) {
      loadRemoteModule(scope, module).then((x) => {
        console.log("loaded module", x, "default", x.default);
        resolve(x);
      });
    } else {
      loadjs("http://localhost:3001/js/_remote_~.subapp2_demo_remote.js", "blah", () => {
        console.log("loaded _remote_~.subapp2_demo_remote.js");
        loadRemoteModule(scope, module).then((x) => {
          console.log("loaded module", x, "default", x.default);
          resolve(x);
        });
      });
    }
  });
}

export const Demo1 = createDynamicComponent(
  {
    name: "demo1",
    getModule: () => import("../demo1"),
  },
  { ssr: true }
);

const Home = (props) => {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>
        <a href="https://www.electrode.io">
          Electrode <img src={electrodePng} />
        </a>
      </h1>
      <p>{message}</p>
      <p>props: {JSON.stringify(props)}</p>
      <h1>Demo1 subapp as a dynamic component in Home</h1>
      <Demo1 />
      <button
        onClick={() => {
          return testLoadRemoteModule("__remote_subapp2_demo_remote", "./Demo2").then((mod) => {
            console.log("setting component", mod.subapp.Component);
          });
        }}
      >
        test load remote Demo1 subapp
      </button>
    </div>
  );
};

export const subapp: ReactSubApp = {
  Component: Home,
  wantFeatures: [
    staticPropsFeature({
      serverModule: require.resolve("./static-props"),
    }),
  ],
};
