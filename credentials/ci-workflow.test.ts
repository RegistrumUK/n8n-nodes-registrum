/* eslint-disable @n8n/community-nodes/no-restricted-imports, @n8n/community-nodes/no-restricted-globals -- a test, excluded from dist; it must read the workflow from disk */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guard tests only protect us if CI runs them and a red default branch is heard
 * (vdmeu/CH-Api#169, #174). This asserts the workflow still does both.
 */
const CI = readFileSync(join(__dirname, '..', '.github', 'workflows', 'ci.yml'), 'utf8');

describe('ci.yml', () => {
	it('runs npm test', () => {
		expect(CI).toMatch(/run:\s*'?npm test'?\s*$/m);
	});

	it('triggers on pushes to the real default branch', () => {
		expect(CI).toMatch(/push:\s*\n\s*branches:\s*\n\s*- master/);
	});

	it('alerts Telegram when the default branch is red', () => {
		expect(CI).toContain("failure() && github.ref == 'refs/heads/master'");
		expect(CI).toContain('api.telegram.org');
		expect(CI).toContain('secrets.TELEGRAM_BOT_TOKEN');
		expect(CI).toContain('secrets.TELEGRAM_CRITICAL_CHAT_ID');
	});
});
