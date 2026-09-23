const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { spawnSync } = require('node:child_process');

function browserSettings(environment = process.env) {
	let origin = 'http://localhost:4200';
	if (environment.CODESPACE_NAME) {
		const name = environment.CODESPACE_NAME;
		const domain = environment.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
		if (!/^[a-z0-9-]+$/i.test(name) || !/^[a-z0-9.-]+$/i.test(domain)) {
			throw new Error('Invalid Codespaces forwarding hostname.');
		}
		origin = `https://${name}-4200.${domain}`;
	}
	return {
		API_BASE_URL: origin,
		CLIENT_BASE_URL: origin,
		ALLOWED_ORIGINS: origin,
		COOKIE_DOMAIN: new URL(origin).hostname
	};
}

function createEnvironment(root, environment = process.env) {
	const filename = path.join(root, '.env');
	if (fs.existsSync(filename) || fs.existsSync(path.join(root, '.env.local'))) return false;
	const settings = {
		NODE_ENV: 'development',
		DEMO: 'true',
		IS_DOCKER: 'false',
		API_HOST: '127.0.0.1',
		API_PORT: '3000',
		...browserSettings(environment),
		TRUST_PROXY: '1',
		DB_ORM: 'typeorm',
		DB_TYPE: 'better-sqlite3',
		DB_PATH: path.join(root, 'apps/api/data/gauzy.sqlite3'),
		DB_SYNCHRONIZE: 'false',
		DB_LOGGING: 'error',
		FILE_PROVIDER: 'LOCAL',
		REDIS_ENABLED: 'false',
		WORKER_QUEUE_ENABLED: 'false',
		WORKER_SCHEDULER_ENABLED: 'false',
		POSTHOG_ENABLED: 'false',
		SENTRY_DSN: '',
		JWT_SECRET: randomBytes(32).toString('hex'),
		JWT_REFRESH_TOKEN_SECRET: randomBytes(32).toString('hex'),
		JWT_VERIFICATION_TOKEN_SECRET: randomBytes(32).toString('hex'),
		EXPRESS_SESSION_SECRET: randomBytes(32).toString('hex')
	};
	fs.writeFileSync(filename, Object.entries(settings).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n', {
		flag: 'wx', mode: 0o600
	});
	return true;
}

function uiArguments(environment) {
	const origin = browserSettings(environment).CLIENT_BASE_URL;
	return [
		'--max-old-space-size=16384', 'node_modules/nx/bin/nx.js', 'serve', 'gauzy',
		'--configuration=local', '--buildTarget=gauzy:build:ci', '--host=0.0.0.0', '--port=4200',
		'--proxyConfig=.devcontainer/proxy.conf.json', '--liveReload=true', '--outputStyle=stream',
		`--publicHost=${origin}`, `--allowedHosts=${new URL(origin).hostname}`
	];
}

function run(command, args, root, environment = process.env) {
	const result = spawnSync(command, args, { cwd: root, env: environment, stdio: 'inherit' });
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`${command} exited with ${result.status ?? result.signal}.`);
}

function main() {
	const root = path.resolve(__dirname, '..');
	const action = process.argv[2];
	if (!['setup', 'api', 'ui'].includes(action)) throw new Error('Usage: node .devcontainer/codespaces.cjs setup|api|ui');
	if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('Node 24 or later is required.');
	createEnvironment(root);

	if (action === 'setup') {
		run('yarn', ['install', '--frozen-lockfile', '--ignore-scripts', '--non-interactive', '--network-timeout', '180000'], root);
		run('yarn', ['postinstall.manual'], root);
	}

	const dotenv = require(path.join(root, 'node_modules/dotenv'));
	const settings = { ...process.env };
	for (const filename of ['.env', '.env.local']) {
		const location = path.join(root, filename);
		if (fs.existsSync(location)) Object.assign(settings, dotenv.parse(fs.readFileSync(location)));
	}
	Object.assign(settings, browserSettings(settings));
	fs.mkdirSync(path.join(root, 'apps/api/data'), { recursive: true });

	if (action === 'api') {
		run(process.execPath, ['--max-old-space-size=6144', '.scripts/dev-api.cjs'], root, settings);
		return;
	}
	run(process.execPath, ['node_modules/ts-node/dist/bin.js', '--transpile-only', '.scripts/configure.ts', '--environment=dev'], root, settings);
	if (action === 'ui') {
		run(process.execPath, uiArguments(settings), root, settings);
	} else {
		console.log('Codespaces setup finished. Run yarn codespaces:start and open private port 4200.');
	}
}

if (require.main === module) {
	try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { browserSettings, createEnvironment, uiArguments };