// contentful-hugo.config.js

require('dotenv').config();

const isProductionEnv = process.env.SOME_ENVIRONMENT_VARIABLE === 'some-value';

module.exports = {
    contentful: {
        space: 'some-id',
        accessToken: 'some-token',
        previewToken: 'some-preview-token',
        environment: isProductionEnv ? 'master' : 'some-other-contentful-env',
    },
    // rest of config
};
