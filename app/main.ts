import * as net from "net";
import { parseRESP } from "./lib/resp-parser";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Starting Aero server...");

const store = new Map<string, string>();

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  console.log("Client connected");

  connection.on("data", (data: Buffer) => {
    const message = data.toString().trim();

    console.log("Raw received: ", JSON.stringify(message));

    try {
      const command = parseRESP(message);
      console.log("Parse command: ", command);

      let [cmd, ...args] = command;
      cmd = cmd.toUpperCase();

      if (cmd === "PING") {
        connection.write("+PONG\r\n");
      } else if (cmd === "ECHO") {
        const str = args[0] || "";
        connection.write(`$${str.length}\r\n${str}\r\n`);
      } else if (cmd === "SET") {
        if (args.length < 2) {
          connection.write("-ERR wrong number of arguments for 'SET'\r\n");
        } else {
          const [key, value] = args;
          store.set(key, value);
          connection.write("+OK\r\n");
        }
      } else if (cmd === "GET") {
        if (args.length < 1) {
          const key = args[0];
          if (store.has(key)) {
            const value = store.get(key)!;
            connection.write(`$${value.length}\r\n${value}\r\n`);
          } else {
            connection.write("$-1\r\n");
          }
        }
      } else {
        connection.write("-ERR unknown commands\r\n");
      }
    } catch (err) {
      connection.write(`-ERR parsing command :: ${err}\r\n`);
    }
  });

  connection.on("end", () => {
    console.log("Client disconnected");
  });
});
//
server.listen(6379, "127.0.0.1", () => {
  console.log("Server listening on 127.0.0.1:6379");
});
