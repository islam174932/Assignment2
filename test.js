const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
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
} = require('./index');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${name} — ${err.message}`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${name} — ${err.message}`);
    failed++;
  }
}

console.log('\nTask 1 - Log current file path and directory');
test('logCurrentFilePath runs without error', () => {
  assert.doesNotThrow(() => logCurrentFilePath());
});

console.log('\nTask 2 - Get file name from path');
test('returns report.pdf from /user/files/report.pdf', () => {
  assert.strictEqual(getFileName('/user/files/report.pdf'), 'report.pdf');
});
test('returns index.js from /home/user/project/index.js', () => {
  assert.strictEqual(getFileName('/home/user/project/index.js'), 'index.js');
});
test('returns file with no extension correctly', () => {
  assert.strictEqual(getFileName('/home/user/Makefile'), 'Makefile');
});

console.log('\nTask 3 - Build path from object');
test('builds /folder/app.js from { dir, name, ext }', () => {
  const result = buildPathFromObject({ dir: '/folder', name: 'app', ext: '.js' });
  assert.strictEqual(result, '/folder/app.js');
});
test('builds /home/user/index.html', () => {
  const result = buildPathFromObject({ dir: '/home/user', name: 'index', ext: '.html' });
  assert.strictEqual(result, '/home/user/index.html');
});

console.log('\nTask 4 - Get file extension');
test('returns .md from /docs/readme.md', () => {
  assert.strictEqual(getFileExtension('/docs/readme.md'), '.md');
});
test('returns .pdf from /user/files/report.pdf', () => {
  assert.strictEqual(getFileExtension('/user/files/report.pdf'), '.pdf');
});
test('returns empty string for file with no extension', () => {
  assert.strictEqual(getFileExtension('/home/Makefile'), '');
});

console.log('\nTask 5 - Parse path into name and ext');
test('parses /home/app/main.js into { Name: "main", Ext: ".js" }', () => {
  const result = parsePath('/home/app/main.js');
  assert.deepStrictEqual(result, { Name: 'main', Ext: '.js' });
});
test('parses /docs/readme.md into { Name: "readme", Ext: ".md" }', () => {
  const result = parsePath('/docs/readme.md');
  assert.deepStrictEqual(result, { Name: 'readme', Ext: '.md' });
});

console.log('\nTask 6 - Check if path is absolute');
test('returns true for /home/user/file.txt', () => {
  assert.strictEqual(isAbsolutePath('/home/user/file.txt'), true);
});
test('returns false for ./relative/path.js', () => {
  assert.strictEqual(isAbsolutePath('./relative/path.js'), false);
});
test('returns false for relative/path.js', () => {
  assert.strictEqual(isAbsolutePath('relative/path.js'), false);
});

console.log('\nTask 7 - Join multiple path segments');
test('joins src, components, App.js correctly', () => {
  const result = joinSegments('src', 'components', 'App.js');
  assert.strictEqual(result, path.join('src', 'components', 'App.js'));
});
test('joins three segments with leading slash', () => {
  const result = joinSegments('/home', 'user', 'file.txt');
  assert.strictEqual(result, '/home/user/file.txt');
});

console.log('\nTask 8 - Resolve relative path to absolute');
test('resolves ./index.js to an absolute path', () => {
  const result = resolveRelativePath('./index.js');
  assert.ok(path.isAbsolute(result));
  assert.ok(result.endsWith('index.js'));
});
test('resolved path does not contain ./', () => {
  const result = resolveRelativePath('./index.js');
  assert.ok(!result.includes('./'));
});

console.log('\nTask 9 - Join two paths');
test('joins /folder1 and folder2/file.txt', () => {
  assert.strictEqual(joinTwoPaths('/folder1', 'folder2/file.txt'), '/folder1/folder2/file.txt');
});
test('joins /a/b and c/d.txt', () => {
  assert.strictEqual(joinTwoPaths('/a/b', 'c/d.txt'), '/a/b/c/d.txt');
});

console.log('\nTask 10 - Delete file asynchronously');
const TMP_FILE = './tmp_delete_test.txt';
fs.writeFileSync(TMP_FILE, 'temp content');

(async () => {
  await testAsync('deletes file and logs message', async () => {
    await deleteFile(TMP_FILE);
    assert.strictEqual(fs.existsSync(TMP_FILE), false);
  });

  await testAsync('throws error for non-existent file', async () => {
    try {
      await deleteFile('./nonexistent_file.txt');
      assert.fail('Should have thrown');
    } catch (err) {
      assert.ok(err.code === 'ENOENT');
    }
  });

  console.log('\nTask 11 - Create folder synchronously');
  const TMP_DIR = './tmp_test_folder';
  test('creates folder and logs Success', () => {
    if (fs.existsSync(TMP_DIR)) fs.rmdirSync(TMP_DIR, { recursive: true });
    createFolder(TMP_DIR);
    assert.strictEqual(fs.existsSync(TMP_DIR), true);
    fs.rmdirSync(TMP_DIR, { recursive: true });
  });
  test('does not throw if folder already exists (recursive)', () => {
    fs.mkdirSync(TMP_DIR);
    assert.doesNotThrow(() => createFolder(TMP_DIR));
    fs.rmdirSync(TMP_DIR, { recursive: true });
  });

  console.log('\nTask 12 - Start event emitter');
  test('emits start event and logs welcome message', () => {
    const emitter = createStartEmitter();
    let output = '';
    const original = console.log;
    console.log = (msg) => { output = msg; };
    emitter.emit('start');
    console.log = original;
    assert.strictEqual(output, 'Welcome event triggered!');
  });

  console.log('\nTask 13 - Login event emitter');
  test('emits login event with username Ahmed', () => {
    const emitter = createLoginEmitter();
    let output = '';
    const original = console.log;
    console.log = (msg) => { output = msg; };
    emitter.emit('login', 'Ahmed');
    console.log = original;
    assert.strictEqual(output, 'User logged in: Ahmed');
  });
  test('emits login event with any username', () => {
    const emitter = createLoginEmitter();
    let output = '';
    const original = console.log;
    console.log = (msg) => { output = msg; };
    emitter.emit('login', 'Islam');
    console.log = original;
    assert.strictEqual(output, 'User logged in: Islam');
  });

  console.log('\nTask 14 - Read file synchronously');
  const NOTES_FILE = './notes.txt';
  fs.writeFileSync(NOTES_FILE, 'This is a note.');
  test('reads file and returns correct content', () => {
    const content = readFileSync(NOTES_FILE);
    assert.strictEqual(content, 'This is a note.');
  });
  test('throws error for non-existent file', () => {
    assert.throws(() => readFileSync('./nonexistent.txt'), { code: 'ENOENT' });
  });
  fs.unlinkSync(NOTES_FILE);

  console.log('\nTask 15 - Write to file asynchronously');
  const ASYNC_FILE = './async.txt';
  await testAsync('writes content to file correctly', async () => {
    await writeFileAsync(ASYNC_FILE, 'Async save');
    const content = fs.readFileSync(ASYNC_FILE, 'utf8');
    assert.strictEqual(content, 'Async save');
    fs.unlinkSync(ASYNC_FILE);
  });
  await testAsync('overwrites existing file content', async () => {
    await writeFileAsync(ASYNC_FILE, 'First write');
    await writeFileAsync(ASYNC_FILE, 'Second write');
    const content = fs.readFileSync(ASYNC_FILE, 'utf8');
    assert.strictEqual(content, 'Second write');
    fs.unlinkSync(ASYNC_FILE);
  });

  console.log('\nTask 16 - Check if directory exists');
  test('returns true for existing path', () => {
    fs.writeFileSync('./notes.txt', 'test');
    assert.strictEqual(directoryExists('./notes.txt'), true);
    fs.unlinkSync('./notes.txt');
  });
  test('returns false for non-existing path', () => {
    assert.strictEqual(directoryExists('./nonexistent_dir_xyz'), false);
  });

  console.log('\nTask 17 - OS platform and CPU architecture');
  test('returns object with Platform and Arch keys', () => {
    const result = getOsInfo();
    assert.ok(result.hasOwnProperty('Platform'));
    assert.ok(result.hasOwnProperty('Arch'));
  });
  test('Platform is a non-empty string', () => {
    const result = getOsInfo();
    assert.ok(typeof result.Platform === 'string' && result.Platform.length > 0);
  });
  test('Arch is a non-empty string', () => {
    const result = getOsInfo();
    assert.ok(typeof result.Arch === 'string' && result.Arch.length > 0);
  });

  console.log(`\n${'─'.repeat(45)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed === 0) {
    console.log('All tests passed!');
  } else {
    process.exit(1);
  }
})();
