import * as net from "net";
import { parseRESP } from "./lib/resp-parser";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Starting Aero server...");

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  console.log("Client connected");

  connection.on("data", (data: Buffer) => {
    const message = data.toString().trim();

    console.log("Raw received: ", JSON.stringify(message));

    try{
        const command = parseRESP(message);
        console.log("Parse command: ", command);

        let [cmd,arg] = command;
        cmd =cmd.toUpperCase();

        if(cmd === "PING"){
            connection.write("+PONG\r\n");
        }else if(cmd === "ECHO"){
            const str = arg || "";
            connection.write(`$${arg.length}\r\n${arg}\r\n`)
        }else {
            connection.write("-ERR unknown commands\r\n");
        }
    }catch(err){
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
