const path = require('node:path');
const { enableCompileCache } = require('node:module');

const root = path.resolve(__dirname, '..');
process.chdir(root);
enableCompileCache(path.join(root, '.cache/node'));
process.env.NODE_ENV ??= 'development';
process.env.TS_NODE_PROJECT = path.join(root, 'apps/api/tsconfig.app.json');

console.log('Loading the local API environment.');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(root, '.env'), quiet: true });
dotenv.config({ path: path.join(root, '.env.local'), quiet: true, override: true });

console.log('Preparing the API source compiler.');
const compiler = require('ts-node').register({
	project: process.env.TS_NODE_PROJECT,
	swc: true,
	transpileOnly: true
});
require('tsconfig-paths').register({
	baseUrl: root,
	paths: compiler.config.options.paths,
	addMatchAll: false
});

console.log('Starting the full API and its configured plugins.');
require('../apps/api/src/main.ts');