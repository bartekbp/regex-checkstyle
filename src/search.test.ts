import search, {File} from './search';

const createListGenerator = async function* (files: File[]): AsyncIterable<File> {
  for(const file of files) {
    yield file;
  }
}

const createGenerator = async function* (content: string, path: string = 'file.txt'): AsyncIterable<File> {
  yield {
    path,
    content,
  }
}

test('Empty input produces empty valid checkstyle file', async () => {
  const result = await search(createListGenerator([]), '.*', '$1')
  return expect(result).toEqualXML(`
<?xml version="1.0" encoding="utf-8"?>
<checkstyle version="4.3">
</checkstyle>`);
});

test('Input with one line produces checkstyle with one violation', async () => {
  const input = `
const _var = 'test';
`

  const output = `
<?xml version="1.0" encoding="utf-8"?>
<checkstyle version="4.3">
  <file name="file.txt">
    <error line="2" column="7" severity="error" message="Variable var starts with underscore" />
  </file>
</checkstyle>`;

  const result = await search(createGenerator(input), '_(\\w+)', 'Variable $1 starts with underscore');
  return expect(result).toEqualXML(output);
});

test('Parses input with linux line endings', async () => {
  const input = '\n\nconst _var = "test";const _var2 = "test2"'

  const output = `
<?xml version="1.0" encoding="utf-8"?>
<checkstyle version="4.3">
  <file name="file.txt">
    <error line="3" column="7" severity="error" message="Variable var starts with underscore" />
    <error line="3" column="27" severity="error" message="Variable var2 starts with underscore" />
  </file>
</checkstyle>`;

  const result = await search(createGenerator(input), '_(\\w+)', 'Variable $1 starts with underscore');
  return expect(result).toEqualXML(output);
});

test('Parses input with windows line endings', async () => {
  const input = '\r\n\r\nconst _var = "test";const _var2 = "test2"'

  const output = `
<?xml version="1.0" encoding="utf-8"?>
<checkstyle version="4.3">
  <file name="file.txt">
    <error line="3" column="7" severity="error" message="Variable var starts with underscore" />
    <error line="3" column="27" severity="error" message="Variable var2 starts with underscore" />
  </file>
</checkstyle>`;

  const result = await search(createGenerator(input), '_(\\w+)', 'Variable $1 starts with underscore');
  return expect(result).toEqualXML(output);
});

test('Input with two lines for different files line produces checkstyle with two files and one violations for each', async () => {
  const input: File[] = [{
    path: 'text1.txt',
    content: 'const _var = "test";'
  }, {
    path: 'text2.txt',
    content: 'const _var2 = "test2";'
  }]

  const output = `
<?xml version="1.0" encoding="utf-8"?>
<checkstyle version="4.3">
  <file name="text1.txt">
    <error line="1" column="7" severity="error" message="Variable var starts with underscore" />
  </file>
  <file name="text2.txt">
    <error line="1" column="7" severity="error" message="Variable var2 starts with underscore" />
  </file>
</checkstyle>`;

  const result = await search(createListGenerator(input), '_(\\w+)', 'Variable $1 starts with underscore');
  return expect(result).toEqualXML(output);
});