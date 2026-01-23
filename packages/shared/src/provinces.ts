/**
 * Canadian Province Configuration
 *
 * Province-specific legal information, messaging, and regulatory context
 * for PropertyCheck's rental inspection features.
 */

export interface ProvinceConfig {
  code: string;
  name: string;
  shortName: string;
  // Legal context
  tenancyAct: string;
  tenancyActShort: string;
  regulatoryBody: string;
  regulatoryBodyUrl: string;
  // Key legal highlights for renters
  legalHighlights: string[];
  // App-specific benefits messaging
  appBenefits: string[];
  // Upgrade modal messaging
  upgradeMessage: string;
  // Dispute resolution context
  disputeBody: string;
  disputeUrl: string;
  // Move-in/move-out inspection requirements
  inspectionRequirements: string;
}

export const PROVINCES: Record<string, ProvinceConfig> = {
  ON: {
    code: 'ON',
    name: 'Ontario',
    shortName: 'Ontario',
    tenancyAct: 'Residential Tenancies Act, 2006',
    tenancyActShort: 'RTA',
    regulatoryBody: 'Landlord and Tenant Board (LTB)',
    regulatoryBodyUrl: 'https://tribunalsontario.ca/ltb/',
    legalHighlights: [
      'Landlords must provide written notice before inspections',
      'Security deposits limited to last month\'s rent only',
      'Move-in/move-out inspections recommended but not mandated',
      'Tenants can dispute unfair damage claims at LTB',
    ],
    appBenefits: [
      'Create timestamped evidence for LTB hearings',
      'Document conditions per Residential Tenancies Act standards',
      'Generate legally defensible PDF reports',
      'Share secure links landlords and adjudicators trust',
    ],
    upgradeMessage: 'Get legally defensible evidence per Residential Tenancies Act',
    disputeBody: 'Landlord and Tenant Board',
    disputeUrl: 'https://tribunalsontario.ca/ltb/',
    inspectionRequirements: 'Not legally required, but strongly recommended to protect your deposit',
  },
  BC: {
    code: 'BC',
    name: 'British Columbia',
    shortName: 'BC',
    tenancyAct: 'Residential Tenancy Act',
    tenancyActShort: 'RTA',
    regulatoryBody: 'Residential Tenancy Branch (RTB)',
    regulatoryBodyUrl: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies',
    legalHighlights: [
      'Move-in AND move-out condition inspections are legally required',
      'Landlord must offer inspection within 1 week of move-in/out',
      'Both parties must sign the condition inspection report',
      'Landlord cannot claim damages without proper inspection',
    ],
    appBenefits: [
      'Meet BC\'s mandatory inspection requirements digitally',
      'Create timestamped photos RTB accepts as evidence',
      'Automatically generate condition inspection reports',
      'Protect your security deposit with proper documentation',
    ],
    upgradeMessage: 'Meet BC\'s mandatory inspection requirements with professional reports',
    disputeBody: 'Residential Tenancy Branch',
    disputeUrl: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems',
    inspectionRequirements: 'Legally required - landlord must offer inspection, tenant can accept or decline',
  },
  AB: {
    code: 'AB',
    name: 'Alberta',
    shortName: 'Alberta',
    tenancyAct: 'Residential Tenancies Act',
    tenancyActShort: 'RTA',
    regulatoryBody: 'Residential Tenancy Dispute Resolution Service (RTDRS)',
    regulatoryBodyUrl: 'https://www.alberta.ca/residential-tenancy-dispute-resolution-service',
    legalHighlights: [
      'Move-in inspection reports required if security deposit collected',
      'Landlord has 10 days to complete move-out inspection',
      'Detailed written inspection report must be provided',
      'Disputes resolved through RTDRS or Provincial Court',
    ],
    appBenefits: [
      'Create inspection reports that meet Alberta requirements',
      'Document damage vs normal wear and tear with photos',
      'Generate professional reports for RTDRS disputes',
      'Secure your deposit with timestamped evidence',
    ],
    upgradeMessage: 'Create Alberta-compliant inspection reports for deposit protection',
    disputeBody: 'Residential Tenancy Dispute Resolution Service',
    disputeUrl: 'https://www.alberta.ca/residential-tenancy-dispute-resolution-service',
    inspectionRequirements: 'Required if landlord collects a security deposit',
  },
  QC: {
    code: 'QC',
    name: 'Quebec',
    shortName: 'Quebec',
    tenancyAct: 'Civil Code of Québec (articles 1851-2000)',
    tenancyActShort: 'Civil Code',
    regulatoryBody: 'Tribunal administratif du logement (TAL)',
    regulatoryBodyUrl: 'https://www.tal.gouv.qc.ca/',
    legalHighlights: [
      'Security deposits are illegal in Quebec',
      'Landlord responsible for normal wear and tear',
      'Tenant must return dwelling in same condition (minus wear)',
      'TAL handles all rental housing disputes',
    ],
    appBenefits: [
      'Document condition despite no deposit requirement',
      'Protect against unfair damage claims at TAL',
      'Create evidence that meets Quebec civil standards',
      'Share professional reports with landlords in French or English',
    ],
    upgradeMessage: 'Protect yourself against unfair damage claims at TAL hearings',
    disputeBody: 'Tribunal administratif du logement',
    disputeUrl: 'https://www.tal.gouv.qc.ca/',
    inspectionRequirements: 'Not legally required, but recommended to document condition',
  },
} as const;

// Province codes for dropdown/selection
export const PROVINCE_CODES = Object.keys(PROVINCES) as (keyof typeof PROVINCES)[];

// Get province by code
export function getProvince(code: string): ProvinceConfig | undefined {
  return PROVINCES[code.toUpperCase()];
}

// Get all provinces as array for dropdowns
export function getProvinceOptions(): { value: string; label: string }[] {
  return Object.values(PROVINCES).map((p) => ({
    value: p.code,
    label: p.name,
  }));
}

// Case studies for "Renters Who Won Deposits Back" section
export interface CaseStudy {
  id: string;
  province: string;
  scenario: string;
  howPropertyCheckHelped: string;
  outcome: string;
  amountSaved: string;
  anonymizedQuote?: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'on-1',
    province: 'ON',
    scenario: 'Landlord claimed tenant caused water damage to bathroom ceiling',
    howPropertyCheckHelped: 'Move-in photos clearly showed pre-existing water stains and peeling paint with GPS timestamps',
    outcome: 'LTB ruled in tenant\'s favor - damage was pre-existing',
    amountSaved: '$1,200',
    anonymizedQuote: 'The adjudicator said my timestamped photos made the case clear-cut.',
  },
  {
    id: 'bc-1',
    province: 'BC',
    scenario: 'Property manager tried to charge for "excessive" wall marks',
    howPropertyCheckHelped: 'Comparison report showed same nail holes and scuff marks were present at move-in',
    outcome: 'Full security deposit returned after RTB dispute',
    amountSaved: '$875',
    anonymizedQuote: 'The side-by-side comparison report proved everything.',
  },
  {
    id: 'ab-1',
    province: 'AB',
    scenario: 'Landlord claimed tenant never completed move-in inspection',
    howPropertyCheckHelped: 'Digital inspection report with date/time stamps and shared link receipt as evidence',
    outcome: 'RTDRS ruled landlord had received the inspection, deposit returned',
    amountSaved: '$1,500',
    anonymizedQuote: 'I had proof I sent them the report - the shared link showed they opened it.',
  },
];

// Get case studies by province
export function getCaseStudiesByProvince(provinceCode: string): CaseStudy[] {
  return CASE_STUDIES.filter((cs) => cs.province === provinceCode.toUpperCase());
}
