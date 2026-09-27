import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RegistrumApi implements ICredentialType {
	name = 'registrumApi';

	displayName = 'Registrum API';

	icon: Icon = { light: 'file:registrum.svg', dark: 'file:registrum.dark.svg' };

	documentationUrl = 'https://github.com/RegistrumUK/n8n-nodes-registrum?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Your Registrum API key. Get one free at https://registrum.co.uk - the free plan needs no card.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	/**
	 * `/v1/usage` is deliberate: it is authenticated, so a wrong key fails the
	 * test, but it reads our own counters rather than calling Companies House.
	 * A test pointed at a company lookup would spend one of the user's monthly
	 * calls, and an upstream Companies House hit, every time they press Save.
	 */
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.registrum.co.uk',
			url: '/v1/usage',
		},
	};
}
