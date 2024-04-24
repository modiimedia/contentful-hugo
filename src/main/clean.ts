import { rm } from 'node:fs/promises';
import { removeLeadingAndTrailingSlashes } from '@helpers/strings';
import { LOG_PREFIX } from '@helpers/contants';
import { ContentfulHugoConfig } from './config';
import { log } from '@/helpers/logger';

const cleanDirectories = async (
    config: ContentfulHugoConfig
): Promise<void> => {
    const dirs: string[] = ['.contentful-hugo'];

    const getRootDir = (directory: string): string => {
        const dir = removeLeadingAndTrailingSlashes(
            directory.replace('./', '')
        );
        const dirParts = dir.split('/');
        return dirParts[0];
    };

    for (const item of config.singleTypes) {
        const newDir = getRootDir(item.directory);
        if (!dirs.includes(newDir)) {
            dirs.push(newDir);
        }
    }

    for (const item of config.repeatableTypes) {
        const newDir = getRootDir(item.directory);
        if (!dirs.includes(newDir)) {
            dirs.push(newDir);
        }
    }

    const tasks: Promise<void>[] = [];
    for (const dir of dirs) {
        tasks.push(
            rm(dir, { recursive: true, force: true }).then(() => {
                log(`${LOG_PREFIX} cleaned ./${dir}`);
            })
        );
    }
    await Promise.all(tasks);
};

export default cleanDirectories;
