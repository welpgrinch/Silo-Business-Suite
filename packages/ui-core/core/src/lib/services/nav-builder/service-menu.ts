import type { NavMenuSectionItem } from './nav-builder-types';

type ServiceGroup = 'erp' | 'crm' | 'hrm' | 'ats' | 'pm';

const SERVICE_GROUPS: ReadonlyArray<{ id: ServiceGroup; title: string; icon: string }> = [
	{ id: 'erp', title: 'ERP', icon: 'fas fa-building' },
	{ id: 'crm', title: 'CRM', icon: 'fas fa-handshake' },
	{ id: 'hrm', title: 'HRM', icon: 'fas fa-users' },
	{ id: 'ats', title: 'ATS', icon: 'fas fa-user-plus' },
	{ id: 'pm', title: 'PM', icon: 'fas fa-tasks' }
];

const SECTION_GROUPS: Readonly<Record<string, ServiceGroup>> = {
	accounting: 'erp',
	sales: 'crm',
	contacts: 'crm',
	jobs: 'crm',
	employees: 'hrm',
	organization: 'erp',
	candidates: 'ats',
	tasks: 'pm',
	goals: 'pm'
};

const ITEM_GROUPS: Readonly<Record<string, ServiceGroup | 'shared'>> = {
	'employees-candidates': 'ats',
	'organization-projects': 'pm',
	'organization-teams': 'hrm',
	'organization-departments': 'hrm',
	'organization-employment': 'hrm',
	'organization-tags': 'shared',
	'organization-documents': 'shared',
	'organization-help': 'shared'
};

function visibleMenuItem(item: NavMenuSectionItem): NavMenuSectionItem | undefined {
	if (item.hidden) {
		return undefined;
	}

	if (!item.children) {
		return { ...item };
	}

	const children = (item.children as NavMenuSectionItem[])
		.map(visibleMenuItem)
		.filter((child): child is NavMenuSectionItem => !!child);

	if (!children.length && !item.link && !item.url && !item.onClick) {
		return undefined;
	}

	return { ...item, children, items: children };
}

function serviceEntries(
	item: NavMenuSectionItem,
	inheritedGroup: ServiceGroup | 'shared'
): Array<{ item: NavMenuSectionItem; group: ServiceGroup | 'shared' }> {
	const group = ITEM_GROUPS[item.id] ?? inheritedGroup;
	const children = (item.children ?? []) as NavMenuSectionItem[];
	const entries = children.flatMap((child) => serviceEntries(child, group));
	if (item.link || item.url || item.onClick) {
		const destination = { ...item };
		delete destination.children;
		delete destination.items;
		entries.unshift({ item: destination, group });
	}
	return entries;
}

export function groupServiceMenuSections(sections: NavMenuSectionItem[]): NavMenuSectionItem[] {
	const shortcuts: NavMenuSectionItem[] = [];
	const shared: NavMenuSectionItem[] = [];
	const grouped = new Map<ServiceGroup, NavMenuSectionItem[]>(SERVICE_GROUPS.map(({ id }) => [id, []]));

	for (const original of sections) {
		const section = visibleMenuItem(original);
		if (!section) {
			continue;
		}

		if (section.id === 'dashboards' || section.id === 'favorites') {
			shortcuts.push(section);
			continue;
		}

		const defaultGroup = SECTION_GROUPS[section.id];
		if (!defaultGroup || section.menuCategory) {
			shared.push(section);
			continue;
		}

		for (const { item: entry, group } of serviceEntries(section, defaultGroup)) {
			const item = entry.id === `${section.id}-manage`
				? { ...entry, title: section.title, data: { ...entry.data, translationKey: section.title, noTranslate: true } }
				: entry;

			if (group === 'shared') {
				shared.push(item);
			} else {
				grouped.get(group)!.push(item);
			}
		}
	}

	const services = SERVICE_GROUPS.flatMap(({ id, title, icon }): NavMenuSectionItem[] => {
		const children = grouped.get(id)!;
		return children.length
			? [{ id: `service-${id}`, title, icon, data: { translationKey: title, noTranslate: true }, children, items: children }]
			: [];
	});

	return [...shortcuts, ...services, ...shared];
}