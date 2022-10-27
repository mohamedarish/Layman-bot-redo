import "dotenv/config";
import { Bot } from "./structures";

const bot = new Bot();

async function main() {
    await bot.start();
}

main().catch(console.error);
