#!/usr/bin/env node

import yargs from 'yargs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { hideBin } from 'yargs/helpers';
import search from './search';

const _var = "test";
const main = async (): Promise<void> => {
  const argv = yargs(hideBin(process.argv))
    .option('pattern', {
      alias: 'p',
      describe: 'Regex to match text',
      demandOption: true,
      type: 'string'
    })
    .option('substitution', {
      alias: 's',
      type: 'string',
      describe: 'Substitution for matched text. You can use $1, $2 etc to refer to capturing groups'
    })
    .command('$0 [glob...]', 'Searches for text in files using regexes and outputs matches in checkstyle search', (yargs) => {
      yargs.positional('glob', {
        describe: 'Glob matching files to process',
        type: 'string',
        demandOption: true
      })}
    )
    .usage(`Usage: $0 -p pattern -s substitution glob > checkstyle.xml`)
    .argv;

  const {pattern, substitution, glob: globs} = argv;
  const output = await search(<string[]>globs ?? ['**'], pattern, substitution);
  console.log(output);
};

main();
