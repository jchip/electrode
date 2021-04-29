/**
 * SubApp version 2 support
 */

import { SubAppWebpackPlugin } from "../plugins/subapp-plugin-webpack5";
import { loadXarcOptions } from "../util/load-xarc-options";
import * as _ from "lodash";
import { ModuleFederationPlugin } from "../container/ModuleFederationPlugin";

module.exports = function(options) {
  const { webpack } = loadXarcOptions();

  const config = {
    optimization: {
      // TODO: always generating runtime chunk could break apps that doesn't
      // check and load it.  don't do this for now.
      // runtimeChunk: "single"
    },
    plugins: [
      new SubAppWebpackPlugin({
        // let plugin figure out webpack version
        webpackVersion: 5,
        assetsFile: "../subapps.json"
      })
    ]
  };
  // let runtimeChunk = "single";

  if (webpack.v2RemoteSubApps) {
    let exposeRemote = 0;
    const cdnMapping = _.get(webpack, "cdn.enable", false) && _.get(webpack, "cdn.mapping", false);
    const modFedPlugins = [].concat(webpack.v2RemoteSubApps).map(remote => {
      //
      const exposes = {
        ...remote.exposes,
        ...remote.subAppsToExpose
      };

      const eager = _.isEmpty(exposes);
      if (!eager) {
        exposeRemote++;
      }
      const shared = Object.keys(remote.shared).reduce((sh, x) => {
        sh[x] = { ...remote.shared[x], eager };
        return sh;
      }, {});

      const idName = remote.name.replace(/[^_\$0-9A-Za-z]/g, "_");
      const name = !eager ? `__remote_${idName}` : idName;

      return new ModuleFederationPlugin({
        name,
        filename: remote.filename || `_remote_~.${idName}.js`,
        entry: [
          cdnMapping && !process.env.WEBPACK_DEV && require.resolve("../client/webpack5-jsonp-cdn")
        ].filter(x => x),
        exposes,
        shared
      } as any);
    });
    config.plugins = [].concat(config.plugins, modFedPlugins).filter(x => x);

    // if app is exposing modules for remote loading, then we must set following
    if (exposeRemote > 0) {
      if (process.env.WEBPACK_DEV || !cdnMapping) {
        // in dev mode there's no CDN mapping, so must set public path to auto for
        // remote container to load its bundles
        options.currentConfig.output.publicPath = "auto";
      }
      // runtimeChunk = undefined;
    }
  }

  // config.optimization = { runtimeChunk };

  return config;
};
