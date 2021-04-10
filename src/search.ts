import checkstyleFormatter, {FileEntry, Message} from 'checkstyle-formatter';
import { sortedIndex } from 'lodash/fp';
import fg from 'fast-glob';
import { promises as fsP } from 'fs';
import matchAll from 'string.prototype.matchall';

export interface File {
  path: string;
  content: string;
}

const createGlobGenerator = async function* (globs: string[]): AsyncIterable<File> {
  const files = await fg(globs, {
    onlyFiles: true, unique: true
  });

  for(const file of files) {
    const text = await fsP.readFile(file, {
      encoding: 'utf-8'
    });

    yield {
      path: file,
      content: text
    }
  }
}

const search = async (files: string[] | AsyncIterable<File>, pattern: string, substitution?: string): Promise<string> => {
  if(Array.isArray(files)) {
    return search(createGlobGenerator(files), pattern, substitution);
  }

  const fileEntries: FileEntry[] = [];
  for await(const file of files) {
    const {content, path } = file;
    const lines = content.split('\n');
    const indexes = lines.reduce<number[]>((acc, content, index) => {
      acc.push(content.length + (index === 0 ? 0 : acc[index - 1] + 1));
      return acc;
    }, [])

    const messages: Message[] = [];
    for(const match of matchAll(content, pattern)) {
      const index = match.index!;
      const lineNumber =  sortedIndex(index, indexes);
      const column = index + 1 - (lineNumber > 0 ? indexes[lineNumber - 1] + 1: 0);
      const matchedText = match[0];
      let message = matchedText;
      if(substitution) {
        message = matchedText.replace(new RegExp(pattern), substitution)
      }

      messages.push({
        line: lineNumber + 1,
        column,
        severity: 'error',
        message,
      });
    }

    fileEntries.push({
      filename: path,
      messages,
    })
  }

  return checkstyleFormatter(fileEntries);
}

export default search;