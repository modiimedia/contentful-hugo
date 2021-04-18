import { copyFile, unlink, copy, ensureDir } from 'fs-extra';
import path from 'path';
import { removeLeadingAndTrailingSlashes } from '@helpers/strings';
import { ContentfulHugoConfig } from '../config';

export const cleanInputAndOutput = (inputDir: string, outputDir: string) => {
    const input = removeLeadingAndTrailingSlashes(inputDir.replace('./', ''));
    const output = removeLeadingAndTrailingSlashes(outputDir.replace('./', ''));
    return {
        input,
        output,
    };
};

export const copyFileToOutputDirectory = (
    filePath: string,
    inputDir: string,
    outputDir: string
): Promise<void> => {
    const { input, output } = cleanInputAndOutput(inputDir, outputDir);
    const newFilePath = filePath.replace(`${input}/`, `${output}/`);
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
        tasks.push(copyInputDirectoryToOutputDirectory(inputDir, outputDir));
    }
    await Promise.all(tasks);
};
