import * as net from "net";
import { parseRESP } from "./lib/resp-parser";
import { commands } from "./utils/command-handlers";
import { errorString } from "./utils/resp-helpers";

console.log("Starting Ether server...");

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

      const handler = commands[cmd];
      if (!handler) {
        connection.write(errorString("unknown command"));
        return;
      }

      const reply = handler(args);
      connection.write(reply);
    } catch (err) {
      connection.write(errorString(`parsing command :: ${err}`));
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
