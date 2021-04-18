import { remove } from 'fs-extra';
import { removeLeadingAndTrailingSlashes } from '@helpers/strings';
import { ContentfulHugoConfig } from './config';

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
        tasks.push(remove(dir));
    }
    await Promise.all(tasks);
};

export default cleanDirectories;
