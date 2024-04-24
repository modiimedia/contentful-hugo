import path from 'path';
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    entries: [
        {
            input: './src/main/index.ts',
            name: 'index',
            outDir: 'dist',
        },
        './src/cli.ts',
    ],
    declaration: true,
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: true,
            tsconfig: 'tsconfig.json',
        },
    },
    outDir: 'dist',
    alias: {
        '@': path.resolve('./src'),
        '@helpers': path.resolve('./src/helpers'),
        '@main': path.resolve('./src/main'),
        '@server': path.resolve('./src/server'),
    },
    failOnWarn: false,
});
