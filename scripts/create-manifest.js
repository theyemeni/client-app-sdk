/* eslint-env node */
const fs = require("fs-extra");
const path = require("path");
const glob = require('glob');

const { WEB_APP_NAME, WEB_APP_VERSION, BUILD_NUMBER } = process.env;
if(!WEB_APP_NAME) throw new Error("WEB_APP_NAME environment variable not set");
if(!WEB_APP_VERSION) throw new Error("WEB_APP_VERSION environment variable not set");
if(!BUILD_NUMBER) throw new Error("BUILD_NUMBER environment variable not set");

fs.outputJSONSync(path.join(__dirname, "../dist-examples/manifest.json"), {
    name: WEB_APP_NAME,
    version: WEB_APP_VERSION,
    build: BUILD_NUMBER,
    buildDate: new Date().toISOString(),
    indexFiles: glob.sync('examples/**/*.html')
        .map(file => ({ file: file.replace('examples/', '') }))
}, { spaces: 2 });
