function parseRESP(input: string): any {
  const lines = input.split("\r\n").filter(Boolean);

  if (lines[0].startsWith("*")) {
    const count = parseInt(lines[0].slice(1), 10);
    const items: string[] = [];

    let i = 1;

    for (let n = 0; n < count; n++) {
      if (lines[i].startsWith("$")) {
        const len = parseInt(lines[i].slice(1), 10);
        const value = lines[i + 1];

        if (value.length != len) {
          throw new Error("Invalid bulk string length");
        }
        items.push(value);
        i += 2;
      } else {
        throw new Error("Unsupported RESP type in array");
      }
    }
    return items;
  }

  throw new Error("Unsupported RESP input");
}

export {
    parseRESP
}