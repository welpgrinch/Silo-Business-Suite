const assert = require('node:assert/strict');
const { test } = require('node:test');
const { groupServiceMenuSections } = require('../packages/ui-core/core/src/lib/services/nav-builder/service-menu.ts');

const item = (id, overrides = {}) => ({
	id,
	title: id,
	link: `/pages/${id}`,
	data: { translationKey: id },
	...overrides
});

const section = (id, children) => item(id, { link: undefined, children });

const destinations = (items) =>
	items.flatMap((entry) => [
		...(entry.link ? [entry.link] : []),
		...destinations(entry.children ?? [])
	]).sort();

test('groups services in ERP, CRM, HRM, ATS, PM order without losing destinations', () => {
	const menu = [
		section('tasks', [item('tasks-team')]),
		section('accounting', [item('accounting-invoices')]),
		section('sales', [item('sales-pipelines')]),
		section('employees', [item('employees-manage'), item('employees-candidates')]),
		section('organization', [item('organization-projects'), item('organization-teams')])
	];
	const result = groupServiceMenuSections(menu);

	assert.deepEqual(result.map((entry) => entry.title), ['ERP', 'CRM', 'HRM', 'ATS', 'PM']);
	assert.deepEqual(destinations(result), destinations(menu));
	assert.deepEqual(result.find((entry) => entry.id === 'service-pm').children.map((entry) => entry.link),
		['/pages/tasks-team', '/pages/organization-projects']);
});

test('keeps dashboard and favorites shortcuts before services and shared plugins afterwards', () => {
	const menu = [
		item('documents'),
		item('dashboards'),
		section('tasks', [item('tasks-team')]),
		item('favorites'),
		item('custom-plugin'),
		section('reports', [item('custom-report')])
	];
	const result = groupServiceMenuSections(menu);

	assert.deepEqual(result.map((entry) => entry.id),
		['dashboards', 'favorites', 'service-pm', 'documents', 'custom-plugin', 'reports']);
	assert.deepEqual(destinations(result), destinations(menu));
});

test('does not expose hidden parents, nested hidden branches, or empty groups', () => {
	const menu = [
		{ ...section('accounting', [item('accounting-invoices')]), hidden: true },
		section('employees', [item('employees-manage', { hidden: true })]),
		section('tasks', [item('tasks-team'), { ...section('private-plugin', [item('private-task')]), hidden: true }]),
		section('reports', [item('private-report', { hidden: true })])
	];

	assert.deepEqual(groupServiceMenuSections(menu).map((entry) => entry.id), ['service-pm']);
	assert.deepEqual(destinations(groupServiceMenuSections(menu)), ['/pages/tasks-team']);
});

test('retains authorization metadata and quick actions without mutating source menus', () => {
	const invoice = item('accounting-invoices', {
		data: {
			translationKey: 'MENU.INVOICES',
			permissionKeys: ['INVOICES_VIEW'],
			featureKey: 'FEATURE_INVOICE',
			add: '/pages/accounting/invoices/add'
		},
		pathMatch: 'full'
	});
	const menu = [section('accounting', [invoice])];
	const original = JSON.stringify(menu);
	const result = groupServiceMenuSections(menu);

	assert.equal(JSON.stringify(menu), original);
	assert.deepEqual(result[0].children[0], invoice);
	assert.notEqual(result[0].children[0], invoice);
});

test('flattens nested plugin destinations to the sidebar supported depth', () => {
	const menu = [section('jobs', [section('job-matching', [item('matching-options')])])];
	const result = groupServiceMenuSections(menu);

	assert.deepEqual(destinations(result), destinations(menu));
	assert.deepEqual(result[0].children.map((entry) => entry.link), ['/pages/matching-options']);
	assert.equal(result[0].children[0].children, undefined);
});

test('keeps nested recruitment destinations in ATS and preserves a linked parent', () => {
	const candidates = section('employees-candidates', [item('candidate-invites')]);
	candidates.link = '/pages/employees/candidates';
	const menu = [section('employees', [candidates])];
	const result = groupServiceMenuSections(menu);

	assert.deepEqual(result.map((entry) => entry.id), ['service-ats']);
	assert.deepEqual(destinations(result), destinations(menu));
	assert.ok(result[0].children.every((entry) => !entry.children));
});

test('separates shared organization tools and retains dynamically contributed children', () => {
	const menu = [section('organization', [
		item('organization-manage'),
		item('organization-projects'),
		item('organization-departments'),
		item('organization-documents'),
		item('organization-extension')
	])];
	const result = groupServiceMenuSections(menu);

	assert.deepEqual(result.map((entry) => entry.id),
		['service-erp', 'service-hrm', 'service-pm', 'organization-documents']);
	assert.deepEqual(destinations(result), destinations(menu));
	assert.equal(result[0].children[0].title, 'organization');
});

test('preserves workspace and settings categories when present', () => {
	const menu = [
		item('organizations', { menuCategory: 'workspace' }),
		item('settings', { menuCategory: 'settings' })
	];

	assert.deepEqual(groupServiceMenuSections(menu), menu);
});

test('returns an empty menu when every item is inaccessible', () => {
	assert.deepEqual(groupServiceMenuSections([item('documents', { hidden: true })]), []);
	assert.deepEqual(groupServiceMenuSections([]), []);
});

test('rebuilds translated labels and visibility without retaining stale state', () => {
	const first = groupServiceMenuSections([
		section('employees', [item('employees-manage'), item('employees-candidates')])
	]);
	const second = groupServiceMenuSections([
		{ ...section('employees', [item('employees-manage'), item('employees-candidates', { hidden: true })]), title: 'Personnel' }
	]);

	assert.deepEqual(first.map((entry) => entry.id), ['service-hrm', 'service-ats']);
	assert.deepEqual(second.map((entry) => entry.id), ['service-hrm']);
	assert.equal(second[0].children[0].title, 'Personnel');
	assert.equal(first[0].children[0].title, 'employees');
});

test('retains both same-label entries and preserves their distinct stable IDs', () => {
	const menu = [
		section('accounting', [item('accounting-expense-recurring', { title: 'Recurring Expenses' })]),
		section('organization', [item('organization-expense', { title: 'Recurring Expenses' })])
	];
	const result = groupServiceMenuSections(menu);

	assert.equal(result[0].children.length, 2);
	assert.equal(new Set(result[0].children.map((entry) => entry.id)).size, 2);
	assert.deepEqual(destinations(result), destinations(menu));
});