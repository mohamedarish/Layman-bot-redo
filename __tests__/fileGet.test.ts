import path from "path";
import { commandFiles, eventFiles } from "../src/files";

it("Should get all files from the commands and events folder", () => {
    expect(commandFiles).toEqual([
        path.dirname(__dirname) + "/src/commands/ping.ts",
        path.dirname(__dirname) + "/src/commands/recommend.ts",
        path.dirname(__dirname) + "/src/commands/search.ts",
        path.dirname(__dirname) + "/src/commands/trending.ts"
    ]);

    expect(eventFiles).toEqual([
        path.dirname(__dirname) + "/src/events/interactionCreate.ts",
        path.dirname(__dirname) + "/src/events/ready.ts"
    ]);
});
