const Fs = require("fs");
const { xarcWebpack } = require("@xarc/app-dev");

function makeConfig() {
  const { compose, getComposeOptions } = xarcWebpack;
  const wConfig = compose(getComposeOptions());

  // wConfig.output.publicPath = "auto";
  // Fs.writeFileSync(".etmp/webpack.config.json", JSON.stringify(wConfig, null, 2));

  return wConfig;
}

module.exports = makeConfig();
