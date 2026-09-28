import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	IDataObject,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class RegistrumApi implements ICredentialType {
	name = 'registrumApi';

	displayName = 'Registrum API';

	icon: Icon = { light: 'file:registrum.svg', dark: 'file:registrum.dark.svg' };

	documentationUrl = 'https://github.com/RegistrumUK/n8n-nodes-registrum?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Access',
			name: 'authMode',
			type: 'options',
			options: [
				{
					name: 'Email (14-Day Free Trial, No Key Needed)',
					value: 'email',
					description: 'Enter your email, click the link we send, and you are set',
				},
				{ name: 'API Key', value: 'apiKey' },
			],
			// apiKey, not email: a credential saved by 0.1.x has no authMode and takes
			// this default, so anything else would switch a working key to an empty email.
			default: 'apiKey',
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			placeholder: 'name@email.com',
			required: true,
			default: '',
			displayOptions: { show: { authMode: ['email'] } },
			description:
				'We email you a confirmation link. Every endpoint is included for 14 days, then the free plan applies. Each save sends a fresh link.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			displayOptions: { show: { authMode: ['apiKey'] } },
			description:
				'Your Registrum API key. Get one free at https://registrum.co.uk - the free plan needs no card.',
		},
		{
			// Filled by preAuthentication and stored encrypted by n8n. `expirable` is
			// what makes n8n call preAuthentication at all.
			displayName: 'Trial Key',
			name: 'trialKey',
			type: 'hidden',
			typeOptions: { expirable: true },
			default: '',
		},
	];

	/**
	 * Email mode: exchange the email for a trial key (vdmeu/CH-Api#153). The key
	 * answers 403 until the emailed link is clicked - deliberately not 401, which
	 * would make n8n re-run this and send a new email on every retry.
	 */
	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		if (credentials.authMode !== 'email') return {};
		try {
			const response = (await this.helpers.httpRequest({
				method: 'POST',
				url: 'https://api.registrum.co.uk/v1/trial',
				body: { email: String(credentials.email ?? '').trim(), source: 'n8n' },
				json: true,
			})) as IDataObject;
			return { trialKey: response.api_key as string };
		} catch (error) {
			const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
			throw new Error(detail ?? (error as Error).message);
		}
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.authMode === "email" ? $credentials.trialKey : $credentials.apiKey}}',
			},
		},
	};

	/**
	 * `/v1/usage` is deliberate: it is authenticated, so a wrong key fails the
	 * test, but it reads our own counters rather than calling Companies House.
	 * A test pointed at a company lookup would spend one of the user's monthly
	 * calls, and an upstream Companies House hit, every time they press Save.
	 * It is also the one endpoint an unverified trial key may read, so the test
	 * can say "check your inbox" instead of failing blankly.
	 */
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.registrum.co.uk',
			url: '/v1/usage',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'trial.status',
					value: 'pending_verification',
					message:
						'Almost there: check your inbox and click the link we just sent. No need to save again - your workflows work as soon as it is clicked.',
				},
			},
		],
	};
}
