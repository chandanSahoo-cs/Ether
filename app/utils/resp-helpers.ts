function simpleString(str: string) {
  return `+${str}\r\n`;
}

function errorString(str: string) {
  return `-ERR ${str}\r\n`;
}

function bulkString(str: string | null) {
  if (str === null) return `$-1\r\n`;
  return `$${str.length}\r\n${str}\r\n`;
}

export { bulkString, errorString, simpleString };
