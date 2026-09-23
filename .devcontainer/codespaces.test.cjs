const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { browserSettings, createEnvironment, uiArguments } = require('./codespaces.cjs');

test('browser and API use the same private forwarded origin', () => {
	const settings = browserSettings({ CODESPACE_NAME: 'silo-test-abc', GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: 'app.github.dev' });
	assert.equal(settings.CLIENT_BASE_URL, 'https://silo-test-abc-4200.app.github.dev');
	assert.equal(settings.API_BASE_URL, settings.CLIENT_BASE_URL);
	assert.equal(settings.ALLOWED_ORIGINS, settings.CLIENT_BASE_URL);
	assert.equal(settings.COOKIE_DOMAIN, 'silo-test-abc-4200.app.github.dev');
});

test('local containers use the UI proxy instead of a cross-origin API', () => {
	assert.equal(browserSettings({}).API_BASE_URL, 'http://localhost:4200');
	assert.equal(browserSettings({ CODESPACE_NAME: 'silo' }).API_BASE_URL, 'https://silo-4200.app.github.dev');
	assert.throws(() => browserSettings({ CODESPACE_NAME: 'bad\nname' }), /Invalid/);
});

test('environment generation is private, idempotent, and does not replace user configuration', (context) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'silo-codespaces-'));
	context.after(() => fs.rmSync(root, { recursive: true, force: true }));
	assert.equal(createEnvironment(root, { CODESPACE_NAME: 'silo' }), true);
	const filename = path.join(root, '.env');
	const content = fs.readFileSync(filename, 'utf8');
	assert.match(content, /DB_SYNCHRONIZE="false"/);
	assert.match(content, /JWT_SECRET="[a-f0-9]{64}"/);
	assert.equal(createEnvironment(root, {}), false);
	assert.equal(fs.readFileSync(filename, 'utf8'), content);
	fs.unlinkSync(filename);
	fs.writeFileSync(path.join(root, '.env.local'), 'EXISTING=true\n');
	assert.equal(createEnvironment(root, {}), false);
	assert.equal(fs.existsSync(filename), false);
	assert.equal(fs.readFileSync(path.join(root, '.env.local'), 'utf8'), 'EXISTING=true\n');
});

test('UI launch allows only the Codespace hostname and retains live reload', () => {
	const args = uiArguments({ CODESPACE_NAME: 'silo' });
	assert.ok(args.includes('--host=0.0.0.0'));
	assert.ok(args.includes('--liveReload=true'));
	assert.ok(args.includes('--allowedHosts=silo-4200.app.github.dev'));
	assert.ok(args.includes('--publicHost=https://silo-4200.app.github.dev'));
	assert.ok(args.includes('--proxyConfig=.devcontainer/proxy.conf.json'));
	assert.ok(!args.some((arg) => arg.includes('disableHostCheck')));
});

test('devcontainer requests enough memory and does not automatically expose the API', () => {
	const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'devcontainer.json'), 'utf8'));
	const proxy = JSON.parse(fs.readFileSync(path.join(__dirname, 'proxy.conf.json'), 'utf8'));
	assert.equal(config.hostRequirements.memory, '32gb');
	assert.deepEqual(config.forwardPorts, [4200]);
	assert.equal(config.portsAttributes['3000'].onAutoForward, 'ignore');
	assert.equal(proxy['/api'].target, 'http://127.0.0.1:3000');
	assert.equal(proxy['/public'].target, 'http://127.0.0.1:3000');
	assert.equal(proxy['/socket.io'].ws, true);
});