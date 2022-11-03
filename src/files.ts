import fs from "fs";
import path from "path";

const getAllFiles = (pathLike: fs.PathLike): string[] => {
    let results: string[] = [];

    const fileList = fs.readdirSync(pathLike);

    for (let i = 0; i < fileList.length; i += 1) {
        const file = fileList[i];
        const stat = fs.statSync(path.join(pathLike.toString(), file));

        results = [
            ...results,
            ...(stat && stat.isDirectory()
                ? getAllFiles(path.join(pathLike.toString(), file))
                : [path.join(pathLike.toString(), file)])
        ];
    }

    return results;
};

const commandFiles = getAllFiles(path.join(__dirname, "commands")).filter(
    (file) => [".ts", ".js"].some((ext) => file.endsWith(ext))
);

const eventFiles = getAllFiles(path.join(__dirname, "events")).filter((file) =>
    [".ts", ".js"].some((ext) => file.endsWith(ext))
);

export { commandFiles, eventFiles };
