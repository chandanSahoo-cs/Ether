import * as net from "net";
import { parseRESP } from "./lib/resp-parser";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Starting Aero server...");

const store = new Map<string, { value: string; expiry: number | undefined }>();

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  console.log("Client connected");

  connection.on("data", (data: Buffer) => {
    const message = data.toString().trim();

    console.log("Raw received: ", JSON.stringify(message));
    console.log(store);

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
          const [key, value, opt, optVal] = args;
          let expiry: number | undefined;

          if (opt && opt.toUpperCase() === "PX" && optVal) {
            const ms = parseInt(optVal, 10);
            if (isNaN(ms)) {
              connection.write("-ERR invalid PX value\r\n");
              return;
            }
            expiry = Date.now() + ms;
          }
          store.set(key, { value, expiry });
          connection.write("+OK\r\n");
        }
      } else if (cmd === "GET") {
        if (args.length >= 1) {
          const [key] = args;

          const entry = store.get(key);

          if (!entry) {
            connection.write("$-1\r\n");
            return;
          }

          if (entry.expiry && Date.now() > entry.expiry) {
            store.delete(key);
            connection.write("$-1\r\n");
            return;
          }

          const value = entry.value;
          connection.write(`$${value.length}\r\n${value}\r\n`);
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
