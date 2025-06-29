// contentful-hugo.config.ts
import { defineConfig } from '../../src/main';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const isProductionEnv = process.env.SOME_ENVIRONMENT_VARIABLE === 'some-value';

export default defineConfig({
    contentful: {
        space: 'some-id',
        token: 'some-token',
        previewToken: 'some-preview-token',
        environment: isProductionEnv ? 'master' : 'some-other-contentful-env',
    },
    // rest of config
});
