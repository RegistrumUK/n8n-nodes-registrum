import { describe, it, expect, vi } from 'vitest';
import type { ICredentialDataDecryptedObject, IHttpRequestHelper } from 'n8n-workflow';
import { RegistrumApi } from './RegistrumApi.credentials';

const credential = new RegistrumApi();
const prop = (name: string) => credential.properties.find((p) => p.name === name);

function helper(response: unknown) {
	const httpRequest = vi.fn().mockResolvedValue(response);
	return { ctx: { helpers: { httpRequest } } as unknown as IHttpRequestHelper, httpRequest };
}

/**
 * Email-only trial (vdmeu/CH-Api#153). A developer types an email, n8n fetches a
 * real key in the background via preAuthentication and stores it encrypted in
 * the hidden `trialKey` field, and the key starts answering once the emailed
 * link is clicked. Nobody copies a key.
 */
describe('email trial access', () => {
	it('keeps existing 0.1.x credentials on API Key mode', () => {
		// A stored credential without authMode takes this default; anything else
		// would silently switch a working key to an empty email on upgrade.
		expect(prop('authMode')?.default).toBe('apiKey');
		const values = (prop('authMode')?.options ?? []).map((o) => (o as { value: string }).value);
		expect(values).toEqual(['email', 'apiKey']);
	});

	it('shows the email field only in email mode, the key field only in key mode', () => {
		expect(prop('email')?.displayOptions?.show?.authMode).toEqual(['email']);
		expect(prop('apiKey')?.displayOptions?.show?.authMode).toEqual(['apiKey']);
	});

	it('stores the fetched key in a hidden expirable field, which is what makes n8n call preAuthentication', () => {
		const trialKey = prop('trialKey');
		expect(trialKey?.type).toBe('hidden');
		expect(trialKey?.typeOptions?.expirable).toBe(true);
		expect(trialKey?.default).toBe('');
	});

	it('requests a trial key for the email and returns it for n8n to store', async () => {
		const { ctx, httpRequest } = helper({ api_key: 'reg_live_x', status: 'pending_verification' });
		const out = await credential.preAuthentication!.call(ctx, {
			authMode: 'email',
			email: ' dev@example.com ',
		} as ICredentialDataDecryptedObject);

		expect(out).toEqual({ trialKey: 'reg_live_x' });
		const req = httpRequest.mock.calls[0][0];
		expect(req.method).toBe('POST');
		expect(req.url).toBe('https://api.registrum.co.uk/v1/trial');
		expect(req.body).toEqual({ email: 'dev@example.com', source: 'n8n' });
	});

	it('does nothing in API Key mode', async () => {
		const { ctx, httpRequest } = helper({});
		const out = await credential.preAuthentication!.call(ctx, {
			authMode: 'apiKey',
			apiKey: 'reg_live_y',
		} as ICredentialDataDecryptedObject);
		expect(out).toEqual({});
		expect(httpRequest).not.toHaveBeenCalled();
	});

	it("passes the API's reason through when the email already has a key", async () => {
		const httpRequest = vi.fn().mockRejectedValue({
			response: { status: 409, data: { detail: 'This email already has a Registrum API key.' } },
		});
		const ctx = { helpers: { httpRequest } } as unknown as IHttpRequestHelper;
		await expect(
			credential.preAuthentication!.call(ctx, { authMode: 'email', email: 'a@b.com' } as ICredentialDataDecryptedObject),
		).rejects.toThrow('already has a Registrum API key');
	});

	it('sends whichever key the mode uses in the same header', () => {
		expect(credential.authenticate.properties.headers).toEqual({
			'X-API-Key': '={{$credentials.authMode === "email" ? $credentials.trialKey : $credentials.apiKey}}',
		});
	});

	it('turns an unclicked link into a clear credential-test message', () => {
		const rule = credential.test.rules?.[0] as {
			type: string;
			properties: { key: string; value: string; message: string };
		};
		expect(rule.type).toBe('responseSuccessBody');
		expect(rule.properties.key).toBe('trial.status');
		expect(rule.properties.value).toBe('pending_verification');
		expect(rule.properties.message.toLowerCase()).toContain('inbox');
	});
});
