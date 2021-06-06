import sharp from "sharp";
import {execFile} from "child_process";
import {gif2webp} from "./webp_converter";

const MAX_SIZE = 1080;

export const resizeAndConvertImage = async (input: string, output: string) => {
    try {
        const image = sharp(input);
        const meta = await image.metadata()
        if (meta.width > MAX_SIZE || meta.height > MAX_SIZE) {
            if (meta.width > meta.height) {
                image.resize(MAX_SIZE, null);
            } else {
                image.resize(null, MAX_SIZE);
            }
        }
        await image
            .webp()
            .toFile(output);
    } catch (e) {
        throw e;
    }
}

type GifInfo = {
    width: number,
    height: number
}

const getGifSize = (input: string): Promise<GifInfo> => {
    const query = `--size-info "${input}"`
    return new Promise((resolve, reject) => {
        execFile("gifsicle", query.split(/\s+/), {shell: true}, (err, stdout, stderr) => {
            if (err) reject(stderr ? stderr : err);
            const _regex = /logical screen (?<width>\d+)x(?<height>\d+)/gm.exec(stdout);
            resolve({width: parseInt(_regex.groups["width"], 10), height: parseInt(_regex.groups["height"], 10)});
        });
    });
}

const resizeGif = (input: string, option: string) => {
    const query = `${option} "${input}" -o "${input}"`
    return new Promise((resolve, reject) => {
        execFile("gifsicle", query.split(/\s+/), {shell: true}, (err, stdout, stderr) => {
            if (err) reject(stderr ? stderr : err);
            resolve(stdout);
        });
    });
}

export const resizeAndConvertGif = async (input: string, output: string) => {
    try {
        const meta = await getGifSize(input);
        if (meta.width > MAX_SIZE || meta.height > MAX_SIZE) {
            if (meta.width > meta.height) {
                await resizeGif(input, `-O2 --resize-method lanczos3 --resize-width ${MAX_SIZE}`);
            } else {
                await resizeGif(input, `-O2 --resize-method lanczos3 --resize-height ${MAX_SIZE}`);
            }
        }
        await gif2webp(`${input}`, output);
    } catch (e) {
        throw e;
    }
}
