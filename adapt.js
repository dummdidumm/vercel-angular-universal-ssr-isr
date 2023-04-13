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

// serverless functions
let group = 1;
function create_serverless_function(name, isr = undefined) {
  const fn_dir = `${out_dir}/functions/${name}.func`;
  write(
    `${fn_dir}/.vc-config.json`,
    JSON.stringify({
      runtime: "nodejs18.x",
      handler: "index.js",
      launcherType: "Nodejs",
    })
  );
  copyFileSync(`${project_dist}/server/main.js`, `${fn_dir}/main.js`);
  write(`${fn_dir}/index.js`, `module.exports = require("./main.js").handle;`);

  // static files also need to be copied to the function dir because the server runtime uses them
  mkdirSync(`${fn_dir}/${project_dist}/browser`, { recursive: true });
  for (const file of static_files) {
    // TODO symlink to save space?
    copyFileSync(
      `${project_dist}/browser/${file}`,
      `${fn_dir}/${project_dist}/browser/${file}`
    );
  }

  if (isr) {
    write(
      `${out_dir}/functions/${name}.prerender-config.json`,
      JSON.stringify({
        expiration: 30,
        group: group++,
        allowQuery: ["__pathname"],
        passQuery: true,
        // TODO fallback? Angular Universal has a prerender mechanism so maybe possible
      })
    );
  }
}

create_serverless_function("ssr");
create_serverless_function("isr", true);

// config
write(
  `${out_dir}/config.json`,
  JSON.stringify({
    version: 3,
    routes: [
      { src: "/", dest: "/ssr" }, // TODO is there a better way to prevent serving index.html from the static dir other than placing this before { handle: "filesystem" }?
      { handle: "filesystem" },
      { src: "/isr-route$", dest: "/isr?__pathname=/isr-route" },
      { src: "/.*", dest: "/ssr" },
    ],
  })
);
