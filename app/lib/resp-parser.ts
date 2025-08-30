function parseRESP(input: string): any {
  let offset = 0;

  function readline(): string {
    const end = input.indexOf("\r\n", offset);
    if (end === -1) throw new Error("Incomplete RESP input");
    const line = input.slice(offset, end);
    offset = end + 2;
    return line;
  }

  function parse(): any {
    const prefix = input[offset];
    if (!prefix) throw new Error("Empty input");

    // Simple string
    if (prefix === "+") {
      offset++;
      return readline();
    }

    // Error
    if (prefix === "-") {
      offset++;
      return new Error(readline());
    }

    // Integer
    if (prefix === ":") {
      offset++;
      return parseInt(readline(), 10);
    }

    // Bulk string
    if (prefix === "$") {
      offset++;
      const len = parseInt(readline(), 10);
      if (len === -1) return null;
      const value = input.slice(offset, offset + len);
      offset += len + 2;
      return value;
    }

    // Array
    if (prefix === "*") {
      offset++;
      const count = parseInt(readline(), 10);
      if (count === -1) return null;

      const items = [];
      for (let i = 0; i < count; i++) {
        items.push(parse());
      }

      return items;
    }

    throw new Error(`Unknown RESP type: ${prefix}`);
  }

  return parse();
}

export { parseRESP };
