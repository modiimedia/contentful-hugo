import chokidar from 'chokidar';
import {
    removeLeadingAndTrailingSlashes,
    replaceBackslashesWithForwardSlashes,
} from '@helpers/strings';
import {
    cleanInputAndOutput,
    copyFileToOutputDirectory,
    deleteFileFromOutputDirectory,
} from './fileManager';
import { ContentfulHugoConfig } from '../config';
import { LOG_PREFIX } from '@/helpers/contants';
import { log } from '@/helpers/logger';

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
    const handleCopy = async (path: string) => {
        const rootDir = getRootDir(path);
        const outDir = directoryMap[rootDir];
        if (!outDir) {
            return;
        }
        await copyFileToOutputDirectory(path, rootDir, outDir);
    };

    const handleDelete = async (path: string) => {
        const rootDir = getRootDir(path);
        const outDir = directoryMap[rootDir];
        if (!outDir) {
            return;
        }
        await deleteFileFromOutputDirectory(path, rootDir, outDir);
    };

    const watcher = chokidar.watch(watchPaths, {
        persistent: true,
    });
    watcher.on('add', (path) => {
        log(`${LOG_PREFIX} ${path} added`);
        return handleCopy(replaceBackslashesWithForwardSlashes(path));
    });
    watcher.on('change', (path) => {
        log(`${LOG_PREFIX} ${path} changed`);
        return handleCopy(replaceBackslashesWithForwardSlashes(path));
    });
    watcher.on('unlink', (path) => {
        log(`${LOG_PREFIX} ${path} deleted`);
        return handleDelete(replaceBackslashesWithForwardSlashes(path));
    });
};

export default createWatcher;
