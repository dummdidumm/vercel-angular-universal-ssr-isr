const { readdirSync, copyFileSync, writeFileSync, mkdirSync } = require("fs");
const { dirname } = require("path");

/**
 * @param {string} file
 * @param {string} data
 */
function write(file, data) {
  try {
    mkdirSync(dirname(file), { recursive: true });
  } catch {}

  writeFileSync(file, data);
}

const out_dir = ".vercel/output";
const project_dist = "dist/angular-ssr-vercel";

// static files
mkdirSync(`${out_dir}/static`, { recursive: true });
const static_files = readdirSync(`${project_dist}/browser`);
for (const file of static_files) {
  copyFileSync(`${project_dist}/browser/${file}`, `${out_dir}/static/${file}`);
}

// serverless function
const fn_dir = `${out_dir}/functions/ssr.func`;
write(
  `${fn_dir}/.vc-config.json`,
  JSON.stringify({
    runtime: "nodejs18.x",
    handler: "index.js",
    launcherType: "Nodejs",
  })
);
copyFileSync(`${project_dist}/server/main.js`, `${fn_dir}/main.js`);
write(`${fn_dir}/index.js`, `module.exports = require("./main.js").app();`);
// static files also need to be copied to the function dir because the server runtime uses them
mkdirSync(`${fn_dir}/${project_dist}/browser`, { recursive: true });
for (const file of static_files) {
  // TODO symlink instead?
  copyFileSync(
    `${project_dist}/browser/${file}`,
    `${fn_dir}/${project_dist}/browser/${file}`
  );
}

// config
write(
  `${out_dir}/config.json`,
  JSON.stringify({
    version: 3,
    routes: [{ src: "/.*", dest: "/ssr" }],
  })
);
