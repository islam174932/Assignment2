const path = require('path');
const fs = require('fs');
const os = require('os');
const EventEmitter = require('events');

function logCurrentFilePath() {
  console.log({ File: __filename, Dir: __dirname });
}

function getFileName(filePath) {
  return path.basename(filePath);
}

function buildPathFromObject({ dir, name, ext }) {
  return path.format({ dir, name, ext });
}

function getFileExtension(filePath) {
  return path.extname(filePath);
}

function parsePath(filePath) {
  const parsed = path.parse(filePath);
  return { Name: parsed.name, Ext: parsed.ext };
}

function isAbsolutePath(filePath) {
  return path.isAbsolute(filePath);
}

function joinSegments(...segments) {
  return path.join(...segments);
}

function resolveRelativePath(relativePath) {
  return path.resolve(relativePath);
}

function joinTwoPaths(p1, p2) {
  return path.join(p1, p2);
}

async function deleteFile(filePath) {
  await fs.promises.unlink(filePath);
  console.log(`The ${path.basename(filePath)} is deleted.`);
}

function createFolder(folderPath) {
  fs.mkdirSync(folderPath, { recursive: true });
  console.log('Success');
}

function createStartEmitter() {
  const emitter = new EventEmitter();
  emitter.on('start', () => {
    console.log('Welcome event triggered!');
  });
  return emitter;
}

function createLoginEmitter() {
  const emitter = new EventEmitter();
  emitter.on('login', (username) => {
    console.log(`User logged in: ${username}`);
  });
  return emitter;
}

function readFileSync(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(content);
  return content;
}

async function writeFileAsync(filePath, content) {
  await fs.promises.writeFile(filePath, content, 'utf8');
}

function directoryExists(dirPath) {
  return fs.existsSync(dirPath);
}

function getOsInfo() {
  return { Platform: os.platform(), Arch: os.arch() };
}

module.exports = {
  logCurrentFilePath,
  getFileName,
  buildPathFromObject,
  getFileExtension,
  parsePath,
  isAbsolutePath,
  joinSegments,
  resolveRelativePath,
  joinTwoPaths,
  deleteFile,
  createFolder,
  createStartEmitter,
  createLoginEmitter,
  readFileSync,
  writeFileAsync,
  directoryExists,
  getOsInfo,
};
