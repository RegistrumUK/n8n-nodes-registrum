/* eslint-disable @n8n/community-nodes/no-restricted-imports, @n8n/community-nodes/no-restricted-globals -- a test, excluded from dist; it must read the shipped copy from disk */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TRIAL_DAYS } from './trial';

/**
 * Offer copy rots: the trial went 14 -> 60 days (vdmeu/CH-Api#169) while this package still
 * said 14. Customer-visible text may state the trial length only via TRIAL_DAYS, and must
 * never type a call quota. No network on purpose - the live value is checked by hand/CI of
 * the API repo; this test only stops the two from drifting inside this package.
 */
const ROOT = join(__dirname, '..');
const SELF = 'credentials/offer-copy.test.ts';
const TRIAL_FILE = 'credentials/trial.ts';

function walk(dir: string, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}

function copyFiles(): { file: string; lines: string[] }[] {
	const files = [join(ROOT, 'README.md'), join(ROOT, 'CHANGELOG.md')];
	for (const d of ['credentials', 'nodes']) {
		for (const p of walk(join(ROOT, d))) {
			if (/\.(ts|json)$/.test(p) && !/\.test\.ts$/.test(p)) files.push(p);
		}
	}
	return files
		.map((f) => ({ file: relative(ROOT, f).split(sep).join('/'), lines: readFileSync(f, 'utf8').split('\n') }))
		.filter((f) => f.file !== SELF && f.file !== TRIAL_FILE);
}

const HOWTO =
	'This is stale offer copy. The source of truth is GET https://api.registrum.co.uk/v1/plans ' +
	'(signup_trial.days), mirrored by TRIAL_DAYS in credentials/trial.ts. Fix: in TypeScript, ' +
	'interpolate TRIAL_DAYS; in README/CHANGELOG, write the same number as TRIAL_DAYS. ' +
	'Never type a call quota or price - link to /v1/plans instead.';

describe('offer copy', () => {
	it('states no day count other than TRIAL_DAYS', () => {
		const bad: string[] = [];
		for (const { file, lines } of copyFiles()) {
			lines.forEach((line, i) => {
				for (const m of line.matchAll(/\b(\d+)[- ]days?\b/gi)) {
					if (Number(m[1]) !== TRIAL_DAYS) bad.push(`${file}:${i + 1}: "${m[0]}" in: ${line.trim()}`);
				}
			});
		}
		expect(bad, `${HOWTO}\n${bad.join('\n')}`).toEqual([]);
	});

	it('types no call quota', () => {
		const re = /\b\d[\d,]*\s*(free\s+)?(api\s+)?(calls|lookups|requests)\s*(\/|per|a)\s*(day|month)/i;
		const bad: string[] = [];
		for (const { file, lines } of copyFiles()) {
			lines.forEach((line, i) => {
				if (re.test(line)) bad.push(`${file}:${i + 1}: ${line.trim()}`);
			});
		}
		expect(bad, `${HOWTO}\n${bad.join('\n')}`).toEqual([]);
	});

	it('the credential copy mentions the trial length from the constant', () => {
		const src = readFileSync(join(ROOT, 'credentials/RegistrumApi.credentials.ts'), 'utf8');
		expect(src).toContain('${TRIAL_DAYS}');
	});
});
