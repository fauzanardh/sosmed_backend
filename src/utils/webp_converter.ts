import {execFile} from "child_process";

export const cwebp = (input: string, output: string, logging: string = "-quiet") => {
    return new Promise((resolve, _) => {
        execFile("cwebp", [input, "-o", output, logging], {shell: true}, (err, stdout, stderr) => {
           if (err) console.warn(err);
           resolve(stdout ? stdout : stderr);
        });
    });
}
