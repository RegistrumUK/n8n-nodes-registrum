import { describe, it, expect } from 'vitest';
import pkg from '../../package.json';
import { Registrum } from './Registrum.node';
import { RegistrumApi } from '../../credentials/RegistrumApi.credentials';

/** The shape this node's operation options actually carry. */
type OperationOption = {
	value: string;
	action?: string;
	routing?: { request?: { method?: string; url?: string } };
};

const description = new Registrum().description;
const credential = new RegistrumApi();

/**
 * n8n rejects a community node for packaging reasons long before anyone judges
 * whether it is useful, and the failures are quiet: a wrong `n8n` path means the
 * node simply never appears. These tests assert the rules from n8n's own
 * verification guidelines so a rename or a new operation cannot break them
 * silently.
 */
describe('package manifest', () => {
	it('is named so n8n will discover it', () => {
		expect(pkg.name.startsWith('n8n-nodes-') || /^@[^/]+\/n8n-nodes-/.test(pkg.name)).toBe(true);
		expect(pkg.keywords).toContain('n8n-community-node-package');
	});

	it('registers the node and credential at their compiled paths', () => {
		expect(pkg.n8n.n8nNodesApiVersion).toBe(1);
		for (const entry of [...pkg.n8n.nodes, ...pkg.n8n.credentials]) {
			expect(entry.startsWith('dist/')).toBe(true);
			expect(entry.endsWith('.js')).toBe(true);
		}
	});

	it('ships no runtime dependencies, which verification forbids', () => {
		const manifest = pkg as Record<string, unknown>;
		expect(manifest.dependencies ?? {}).toEqual({});
		expect(Object.keys(pkg.peerDependencies)).toEqual(['n8n-workflow']);
	});

	it('publishes with public access, or provenance cannot attach', () => {
		// The 0.1.0 publish failed on exactly this: "Can't generate provenance for
		// new or private package, you must set `access` to public." Provenance is
		// what n8n verification requires, so the publish is worthless without it.
		expect(pkg.publishConfig.access).toBe('public');
		expect(pkg.publishConfig.provenance).toBe(true);
	});

	it('carries the metadata verification requires', () => {
		expect(pkg.license).toBe('MIT');
		expect(pkg.files).toContain('dist');
		expect(pkg.homepage).toBeTruthy();
		expect(pkg.author.name).toBeTruthy();
		expect(pkg.repository.url).toContain('github.com');
	});
});

describe('node description', () => {
	it('declares the fields n8n renders the node from', () => {
		expect(description.displayName).toBe('Registrum');
		expect(description.name).toBe('registrum');
		expect(description.subtitle).toBeTruthy();
		expect(description.icon).toEqual({
			light: 'file:registrum.svg',
			dark: 'file:registrum.dark.svg',
		});
		expect(description.requestDefaults?.baseURL).toBe('https://api.registrum.co.uk');
	});

	it('requires the credential it actually authenticates with', () => {
		expect(description.credentials).toEqual([{ name: credential.name, required: true }]);
	});

	it('gives every operation a route, since a declarative node has no execute()', () => {
		const operations = description.properties
			.filter((p) => p.name === 'operation')
			.flatMap((p) => p.options ?? []);

		expect(operations.length).toBeGreaterThan(5);
		for (const option of operations as OperationOption[]) {
			expect(option.routing?.request?.method, `${option.value} has no method`).toBe('GET');
			const url = option.routing?.request?.url as string;
			expect(url, `${option.value} has no url`).toBeTruthy();
			// A literal path, or an expression - anything else silently hits baseURL.
			expect(url.startsWith('/') || url.startsWith('=/')).toBe(true);
			expect(option.action, `${option.value} has no action label`).toBeTruthy();
		}
	});

	it('asks for a company number on every operation that interpolates one', () => {
		const operations = description.properties
			.filter((p) => p.name === 'operation')
			.flatMap((p) => p.options ?? []) as OperationOption[];

		const needsNumber = operations
			.filter((o) => String(o.routing?.request?.url).includes('$parameter.companyNumber'))
			.map((o) => o.value as string);

		const field = description.properties.find((p) => p.name === 'companyNumber');
		expect(field, 'no companyNumber field').toBeTruthy();
		const shownFor = field!.displayOptions?.show?.operation as string[];
		for (const operation of needsNumber) {
			expect(shownFor, `companyNumber is hidden for ${operation}`).toContain(operation);
		}
	});
});

describe('credential', () => {
	it('sends the key in the header the API actually reads', () => {
		expect(credential.authenticate.properties.headers).toEqual({
			'X-API-Key': '={{$credentials.apiKey}}',
		});
	});

	it('hides the key in the UI', () => {
		const apiKey = credential.properties.find((p) => p.name === 'apiKey');
		expect(apiKey?.typeOptions?.password).toBe(true);
	});

	it('tests the credential without spending a company lookup', () => {
		// /v1/usage is authenticated but reads our own counters. A test pointed at
		// a company lookup would spend one of the user's monthly calls, and one
		// upstream Companies House call, every time they press Save.
		expect(credential.test.request.url).toBe('/v1/usage');
	});
});
