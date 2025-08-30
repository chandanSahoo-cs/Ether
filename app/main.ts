import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Starting Aero server...");

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  console.log("Client connected");

  connection.on("data", (data: Buffer) => {
    const message = data.toString().trim();

    console.log("Received: ", JSON.stringify(message));

    if (message.includes("PING")) {
      connection.write("+PONG\r\n");
    } else {
      connection.write("-ERR unknown command\r\n");
    }
  });

  connection.on("end",()=>{
    console.log("Client disconnected");
  })
});
//
server.listen(6379, "127.0.0.1",()=>{
    console.log("Server listening on 127.0.0.1:6379")
});
