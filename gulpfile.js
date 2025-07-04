const fs = require('fs-extra');
const path = require('path');
const gulp = require('gulp');
const shell = require('gulp-shell');
const merge = require('merge-stream');
const archiver = require('archiver');

const distPath = "./dist";
const packSource = `./data`;
const packTarget = `./packs`;

/* ----------------------------------------- */
/*  Compile and Extract packs to yaml
/* ----------------------------------------- */

async function packData() {
  // Add every folder in the src folder so they become a compendium.
  const folders = fs.readdirSync(packSource).filter((file) => {
    return fs.statSync(path.join(packSource, file)).isDirectory();
  });

  // Create a stream for all files in the source folders.
  const packs = folders.map((folder) => {
    console.log(`Mapped Compendium: ${folder}`);
    return gulp.src(path.join(packSource, folder))
      .pipe(shell([
        `fvtt package --id daggerheart --type System pack <%= file.stem %> -c --yaml --in "<%= file.path %>" --out ${packTarget}`
      ]))
  })

  // Call the streams and execute them.
  return merge.call(null, packs);
}

async function unpackData() {
  // Start a stream for all db files in the packs dir.
  const packs = gulp.src(`${packTarget}/*`)
    .pipe(shell([
      `fvtt package --id daggerheart --type System unpack <%= file.stem %> -c --yaml --in ${packTarget} --out ${packSource}/<%= file.stem %>`
    ]));

  // Call the streams and execute them.
  return merge.call(null, packs);
}


/* ----------------------------------------- */
/*  Create versioned module file
/* ----------------------------------------- */

async function setVersion() {
  const path = `${distPath}/module.json`
  await fs.copy(`./module.json`, path);

  const version = process.env.RELEASE_VER || tag?.replace('v', '');

  const moduleData = JSON.parse(fs.readFileSync(path, 'utf8'));
  moduleData.version = version;

  // Write back to file
  fs.writeFileSync(path, JSON.stringify(moduleData, null, 2));
}


/* ----------------------------------------- */
/*  Build release files and archives
/* ----------------------------------------- */

async function buildRelease() {
  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  // Copy the module file
  await fs.copy(`./module.json`,
    `${distPath}/module.json`
  );

  // Create a file to stream archive data to
  const output = fs.createWriteStream(
    `${distPath}/module.zip`
  );
  output.on('close', function () {
    console.log(`Module data: ${archive.pointer()} bytes)`);
  });

  // Create the output archive
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', function (err) {
    throw err;
  });
  archive.pipe(output);

  // Add files and packs
  archive.file(`./module.json`, {
    name: 'module.json'
  });
  archive.directory('./assets', 'assets');
  archive.directory('./packs', 'packs');

  // Finalize the archive
  await archive.finalize().then((resolve) => {
    output.close();
  });
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

module.exports = {
  pack: packData,
  unpack: unpackData,
  version: setVersion,
  release: buildRelease,
}