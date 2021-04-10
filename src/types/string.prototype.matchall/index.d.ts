declare module 'string.prototype.matchall' {
  export default MatchAll;
  function MatchAll(input: string, pattern: string): IterableIterator<RegExpMatchArray>;
}