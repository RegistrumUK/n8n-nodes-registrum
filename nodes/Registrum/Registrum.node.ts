import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { companyDescription } from './resources/company';

export class Registrum implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Registrum',
		name: 'registrum',
		icon: { light: 'file:registrum.svg', dark: 'file:registrum.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Look up UK company data from Companies House: profiles, directors, owners, accounts and identity-verification status',
		defaults: {
			name: 'Registrum',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'registrumApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.registrum.co.uk',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Company',
						value: 'company',
					},
				],
				default: 'company',
			},
			...companyDescription,
		],
	};
}
