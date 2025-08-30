import { getEntry, setEntry } from "../lib/store";
import { bulkString, errorString, simpleString } from "./resp-helpers";

const commands: Record<string, (args: string[]) => string> = {
  PING: () => simpleString("PONG"),
  ECHO: (args) => {
    if (args.length < 1)
      return errorString("wrong number of arguments for 'ECHO'");
    return bulkString(args[0]);
  },
  SET: (args) => {
    if (args.length < 2)
      return errorString("wrong number of arguments for 'SET'");
    const [key, value, opt, optVal] = args;

    let expiry: number | undefined;

    if (opt && opt.toUpperCase() === "PX") {
      if (!optVal) return errorString("PX requires milliseconds");
      const ms = parseInt(optVal, 10);
      if (isNaN(ms)) return errorString("Invalid PX value");
      expiry = Date.now() + ms;
    }

    setEntry(key, value, expiry);
    return simpleString("OK");
  },
  GET: (args) => {
    if (args.length < 1)
      return errorString("wrong number of arguments for 'GET'");
    const [key] = args;
    return bulkString(getEntry(key));
  },
};

export {
    commands
}