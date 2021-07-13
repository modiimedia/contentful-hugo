import { copyFile, unlink, copy, ensureDir, ensureFile } from 'fs-extra';
import path from 'path';
import { removeLeadingAndTrailingSlashes } from '@helpers/strings';
import { ContentfulHugoConfig } from '../config';

export const cleanInputAndOutput = (
    inputDir: string,
    outputDir: string
): { input: string; output: string } => {
    const input = removeLeadingAndTrailingSlashes(inputDir.replace('./', ''));
    const output = removeLeadingAndTrailingSlashes(outputDir.replace('./', ''));
    return {
        input,
        output,
    };
};

export const copyFileToOutputDirectory = async (
    filePath: string,
    inputDir: string,
    outputDir: string
): Promise<void> => {
    const { input, output } = cleanInputAndOutput(inputDir, outputDir);
    const newFilePath = filePath.replace(`${input}/`, `${output}/`);
    await ensureFile(newFilePath);
    return copyFile(filePath, newFilePath);
};

export const deleteFileFromOutputDirectory = (
    filePath: string,
    inputDir: string,
    outputDir: string
): Promise<void> => {
    const { input, output } = cleanInputAndOutput(inputDir, outputDir);
    const newFilePath = filePath.replace(`${input}/`, `${output}/`);
    return unlink(newFilePath);
};

export const copyInputDirectoryToOutputDirectory = async (
    inputDir: string,
    outputDir: string
): Promise<void> => {
    await ensureDir(inputDir);
    const srcPath = path.resolve(inputDir);
    const outPath = path.resolve(outputDir);
    return copy(srcPath, outPath);
};

export const copyStaticContent = async (
    config: ContentfulHugoConfig
): Promise<void> => {
    if (!config.staticContent || !config.staticContent.length) {
        return;
    }
    const tasks: Promise<void>[] = [];
    for (const item of config.staticContent) {
        const { inputDir, outputDir } = item;
        if (!inputDir) {
            throw new Error(
                `staticContent item config is missing required field "inputDir"`
            );
        }
        if (!outputDir) {
            throw new Error(
                `staticContent item config is missing required field "outputDir"`
            );
        }
        tasks.push(copyInputDirectoryToOutputDirectory(inputDir, outputDir));
    }
    await Promise.all(tasks);
};
