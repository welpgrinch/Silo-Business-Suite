const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const reportDirectory = path.join(root, 'tmp');
const reportPath = path.join(reportDirectory, 'local-runtime-status.json');
fs.mkdirSync(reportDirectory, { recursive: true });
const report = { checkedAt: new Date().toISOString(), node: process.version, checks: {} };

function save() {
	fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

async function main() {
	save();
	console.log(`Checking local setup: ${report.checkedAt}`);
	const space = fs.statfsSync(root);
	report.checks.resources = {
		totalMemoryGB: Math.round(os.totalmem() / 1073741824),
		freeMemoryGB: Math.round(os.freemem() / 1073741824),
		freeDiskGB: Math.round(space.bavail * space.bsize / 1073741824)
	};
	if (process.platform === 'win32') {
		const registry = spawnSync('reg.exe', [
			'query', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem', '/v', 'LongPathsEnabled'
		], { encoding: 'utf8', timeout: 5000 });
		report.checks.longPaths = { exitCode: registry.status, output: registry.stdout, error: registry.error?.message };
	}
	report.checks.installation = {
		integrityMarker: fs.existsSync(path.join(root, 'node_modules/.yarn-integrity')),
		commandShims: fs.existsSync(path.join(root, 'node_modules/.bin/nx.cmd')),
		workspaceCore: fs.existsSync(path.join(root, 'node_modules/@gauzy/core/package.json')),
		uiEnvironment: fs.existsSync(path.join(root, 'packages/ui-config/src/lib/environments/environment.ts'))
	};
	save();
	try {
		const SQLite = require('better-sqlite3');
		const database = new SQLite(':memory:');
		report.checks.sqlite = database.prepare('SELECT sqlite_version() AS version').get();
		database.close();
	} catch (error) {
		report.checks.sqlite = { error: error.message };
	}
	save();
	const compiler = spawnSync(process.execPath, [
		'-e',
		"console.log(require('esbuild').transformSync('const ready: boolean = true;', { loader: 'ts' }).code);"
	], { cwd: root, encoding: 'utf8', timeout: 15000 });
	report.checks.esbuild = {
		exitCode: compiler.status,
		output: compiler.stdout,
		error: compiler.error?.message ?? compiler.stderr
	};
	save();
	for (const [service, url] of [
		['api', 'http://localhost:3000/api/health'],
		['ui', 'http://127.0.0.1:4200']
	]) {
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
			report.checks[service] = { url, status: response.status };
			await response.body?.cancel();
		} catch (error) {
			report.checks[service] = { url, error: error.message };
		}
		save();
	}
	console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
	report.error = error.message;
	save();
	console.error(error);
	process.exitCode = 1;
});