const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '..');
const modules = path.join(root, 'node_modules');
const cache = path.join(process.env.LOCALAPPDATA, 'Yarn/Cache/v6');
const entries = fs.readdirSync(cache);

function packageDirectories(directory) {
	if (!fs.existsSync(directory)) return [];
	const packages = [];
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
		const location = path.join(directory, entry.name);
		if (entry.name.startsWith('@')) {
			packages.push(...packageDirectories(location));
		} else {
			packages.push(location, ...packageDirectories(path.join(location, 'node_modules')));
		}
	}
	return packages;
}

function copyMissing(source, destination) {
	fs.mkdirSync(path.toNamespacedPath(destination), { recursive: true });
	const existing = new Set(fs.readdirSync(path.toNamespacedPath(destination)));
	let copied = 0;
	for (const entry of fs.readdirSync(path.toNamespacedPath(source), { withFileTypes: true })) {
		if (entry.name.startsWith('.yarn-')) continue;
		const sourcePath = path.join(source, entry.name);
		const destinationPath = path.join(destination, entry.name);
		if (entry.isDirectory()) {
			copied += copyMissing(sourcePath, destinationPath);
		} else if (entry.isFile() && !existing.has(entry.name)) {
			fs.copyFileSync(path.toNamespacedPath(sourcePath), path.toNamespacedPath(destinationPath), fs.constants.COPYFILE_EXCL);
			copied++;
		}
	}
	return copied;
}

const argumentsList = process.argv.slice(2);
const all = argumentsList.includes('--all');
const dependencies = argumentsList.includes('--dependencies');
const targets = argumentsList.filter((argument) => argument !== '--dependencies');
const directories = all ? packageDirectories(modules) : targets.map((relative) => path.resolve(modules, relative));
const lockfile = dependencies ? require('@yarnpkg/lockfile').parse(fs.readFileSync(path.join(root, 'yarn.lock'), 'utf8')).object : undefined;
const visited = new Set();

function restoreDependency(name, range, parent) {
	const searchPaths = createRequire(path.join(parent, 'package.json')).resolve.paths(name) ?? [];
	for (const searchPath of searchPaths) {
		const existing = path.join(searchPath, name);
		if (fs.existsSync(path.join(existing, 'package.json'))) return existing;
	}
	const locked = lockfile[`${name}@${range}`];
	if (!locked?.integrity) throw new Error(`No integrity-locked dependency: ${name}@${range}`);
	const prefix = `npm-${name.replace(/[/.]/g, '-')}-${locked.version}-`;
	const matches = entries.filter((entry) => entry.startsWith(prefix));
	if (matches.length !== 1) throw new Error(`Expected one cached ${name}@${locked.version}.`);
	const source = path.join(cache, matches[0], 'node_modules', name);
	const archive = fs.readFileSync(path.join(source, '.yarn-tarball.tgz'));
	const verified = locked.integrity.split(/\s+/).some((integrity) => {
		const separator = integrity.indexOf('-');
		const algorithm = integrity.slice(0, separator);
		if (!['sha1', 'sha256', 'sha384', 'sha512'].includes(algorithm)) return false;
		return crypto.createHash(algorithm).update(archive).digest('base64') === integrity.slice(separator + 1);
	});
	if (!verified) throw new Error(`Archive integrity mismatch for ${name}@${locked.version}.`);
	const cached = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
	if (cached.name !== name || cached.version !== locked.version) throw new Error(`Cached manifest mismatch: ${name}`);
	const destination = path.join(parent, 'node_modules', name);
	copyMissing(source, destination);
	console.log(`Restored locked dependency ${name}@${locked.version}`);
	return destination;
}

if (all) {
	for (const parent of ['apps', 'packages', 'packages/plugins']) {
		for (const entry of fs.readdirSync(path.join(root, parent), { withFileTypes: true })) {
			if (entry.isDirectory()) directories.push(...packageDirectories(path.join(root, parent, entry.name, 'node_modules')));
		}
	}
	directories.push(...packageDirectories(path.join(root, 'tools/node_modules')));
}

const result = { packagesChecked: 0, packagesRepaired: 0, filesRestored: 0, uncached: [] };
for (const destination of directories) {
	const identity = path.resolve(destination).toLowerCase();
	if (visited.has(identity)) continue;
	visited.add(identity);
	if (dependencies && visited.size > 2000) throw new Error('Dependency repair scope exceeds 2000 packages.');
	const relative = path.relative(root, destination);
	if (relative.startsWith('..') || !relative.split(path.sep).includes('node_modules')) {
		throw new Error('Repair target must be inside this repository\'s node_modules.');
	}
	const manifestPath = path.join(destination, 'package.json');
	if (!fs.existsSync(manifestPath)) continue;
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	const prefix = `npm-${manifest.name.replace(/[/.]/g, '-')}-${manifest.version}-`;
	const matches = entries.filter((entry) => entry.startsWith(prefix));
	if (matches.length !== 1) {
		if (all) {
			result.uncached.push(`${manifest.name}@${manifest.version}`);
			continue;
		}
		throw new Error(`Expected one cached copy of ${manifest.name}@${manifest.version}, found ${matches.length}.`);
	}

	const source = path.join(cache, matches[0], 'node_modules', manifest.name);
	const cached = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
	if (cached.name !== manifest.name || cached.version !== manifest.version) {
		throw new Error(`Cached package does not match ${manifest.name}@${manifest.version}.`);
	}

	const restored = copyMissing(source, destination);
	result.packagesChecked++;
	result.filesRestored += restored;
	if (restored) result.packagesRepaired++;
	if (!all || result.packagesChecked % 100 === 0) {
		console.log(`Checked ${result.packagesChecked} packages; restored ${result.filesRestored} missing files.`);
	}
	if (dependencies) {
		for (const [name, range] of Object.entries(manifest.dependencies ?? {})) {
			directories.push(restoreDependency(name, range, destination));
		}
	}
}

fs.writeFileSync(path.join(os.tmpdir(), 'point-gauzy-cache-repair.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));