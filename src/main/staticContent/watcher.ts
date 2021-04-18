import chokidar from 'chokidar';
import {
    cleanInputAndOutput,
    copyFileToOutputDirectory,
    deleteFileFromOutputDirectory,
} from './fileManager';
import { ContentfulHugoConfig } from '../config';
import { removeLeadingAndTrailingSlashes } from '@helpers/strings';

const createWatcher = (config: ContentfulHugoConfig): void => {
    if (!config.singleTypes || !config.staticContent.length) {
        return;
    }
    const directoryMap: { [key: string]: string } = {};
    const watchPaths: string[] = [];
    for (const item of config.staticContent) {
        const { input, output } = cleanInputAndOutput(
            item.inputDir,
            item.outputDir
        );
        watchPaths.push(input);
        directoryMap[input] = output;
    }

    const getRootDir = (path: string) => {
        const filePath = removeLeadingAndTrailingSlashes(path);
        const pathParts = filePath.split('/');
        return pathParts[0];
    };
    const handleCopy = (path: string) => {
        const rootDir = getRootDir(path);
        const outDir = directoryMap[rootDir];
        if (!outDir) {
            return;
        }
        return copyFileToOutputDirectory(path, rootDir, outDir);
    };

    const handleDelete = (path: string) => {
        const rootDir = getRootDir(path);
        const outDir = directoryMap[rootDir];
        if (!outDir) {
            return;
        }
        return deleteFileFromOutputDirectory(path, rootDir, outDir);
    };

    const watcher = chokidar.watch(watchPaths);
    watcher.on('add', (path) => {
        console.log(`[contentful hugo] ${path} added`);
        return handleCopy(path);
    });
    watcher.on('change', (path) => {
        console.log(`[contentful hugo] ${path} changed`);
        return handleCopy(path);
    });
    watcher.on('unlink', (path) => {
        console.log(`[contentful hugo] ${path} deleted`);
        return handleDelete(path);
    });
};

export default createWatcher;
