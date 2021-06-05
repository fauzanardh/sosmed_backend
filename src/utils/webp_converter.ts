import {execFile} from "child_process";

export const cwebp = (input: string, output: string, logging: string = "-quiet") => {
    return new Promise((resolve, reject) => {
        execFile("cwebp", [input, "-o", output, logging], {shell: true}, (err, stdout, stderr) => {
            if (err) reject(stderr ? stderr : err);
            resolve(stdout);
        });
    });
}

export const gif2webp = (input: string, output: string, logging: string = "-quiet") => {
    return new Promise((resolve, reject) => {
        execFile("gif2webp", ["-mt", input, "-o", output, logging], {shell: true}, (err, stdout, stderr) => {
            if (err) reject(stderr ? stderr : err);
            resolve(stdout);
        });
    });
}
