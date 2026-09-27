import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompany = {
	resource: ['company'],
};

/** Every operation that takes a company number shows the same field. */
const showForCompanyNumberOperations = {
	resource: ['company'],
	operation: ['get', 'bundle', 'directors', 'network', 'psc', 'pscChain', 'financials', 'compliance'],
};

export const companyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForCompany },
		options: [
			{
				name: 'Get Director Network',
				value: 'network',
				action: 'Get companies connected through shared directors',
				description: 'Companies connected to this one through shared officers',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/company/{{$parameter.companyNumber}}/network',
					},
				},
			},
			{
				name: 'Get Directors',
				value: 'directors',
				action: 'Get the directors of a company',
				description: 'Current and resigned officers, with their other appointments',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/company/{{$parameter.companyNumber}}/directors',
					},
				},
			},
			{
				name: 'Get Everything',
				value: 'bundle',
				action: 'Get a whole company in one call',
				description:
					'Profile, directors, PSC, financials and ECCTA status in one request, charged as one call',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/company/{{$parameter.companyNumber}}/bundle',
					},
				},
			},
			{
				name: 'Get Financials',
				value: 'financials',
				action: 'Get parsed accounts',
				description: 'Accounts parsed from the filed iXBRL. Returns available false rather than guessing when a filing carries no figures.',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/company/{{$parameter.companyNumber}}/financials',
					},
				},
			},
			{
				name: 'Get Identity Verification Status',
				value: 'compliance',
				action: 'Get ECCTA identity verification status',
				description:
					'Which directors and PSCs have verified their identity, and the per-person deadline for those who have not',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/company/{{$parameter.companyNumber}}/compliance',
					},
				},
			},
			{
				name: 'Get Owners',
				value: 'psc',
				action: 'Get the people with significant control',
				description: 'Persons with significant control, with decoded natures of control',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/company/{{$parameter.companyNumber}}/psc',
					},
				},
			},
			{
				name: 'Get Ownership Chain',
				value: 'pscChain',
				action: 'Trace ownership to the individuals behind it',
				description:
					'Follow corporate owners through holding companies until individuals are reached',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/company/{{$parameter.companyNumber}}/psc/chain',
					},
				},
			},
			{
				name: 'Get Profile',
				value: 'get',
				action: 'Get a company profile',
				description: 'Registered name, status, address, SIC codes and filing dates',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/company/{{$parameter.companyNumber}}',
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search for a company by name',
				description: 'Find UK companies by name or number',
				routing: {
					request: {
						method: 'GET',
						url: '/v1/search',
						qs: {
							q: '={{$parameter.query}}',
						},
					},
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Company Number',
		name: 'companyNumber',
		type: 'string',
		required: true,
		displayOptions: { show: showForCompanyNumberOperations },
		default: '',
		placeholder: '00445790',
		description:
			'The Companies House company number. Numeric-only numbers are zero-padded to eight digits, so 445790 and 00445790 both work.',
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['company'], operation: ['search'] } },
		default: '',
		placeholder: 'tesco',
		description: 'Company name or number to search for',
	},
];
