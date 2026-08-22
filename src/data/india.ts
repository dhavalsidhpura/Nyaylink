export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const STATE_INTAKE_GUIDANCE: Record<string, {
  label: string;
  locationLabel: string;
  locationPlaceholder: string;
  note: string;
  nextSteps: string[];
}> = {
  Maharashtra: {
    label: 'Maharashtra',
    locationLabel: 'City / district',
    locationPlaceholder: 'e.g. Mumbai, Pune, Nashik',
    note: 'The exact municipal or labour-office route can depend on your city, premises, business activity, and employee count.',
    nextSteps: ['Confirm the city or district', 'Tell us the approximate employee count', 'Keep premises and address proof ready'],
  },
  Gujarat: {
    label: 'Gujarat',
    locationLabel: 'City / district',
    locationPlaceholder: 'e.g. Ahmedabad, Surat, Vadodara',
    note: 'The service route can depend on the municipality, business activity, premises, and whether e-stamping or registration support is needed.',
    nextSteps: ['Confirm the city or district', 'Tell us the business activity', 'Keep premises and address proof ready'],
  },
  default: {
    label: 'your state',
    locationLabel: 'City / district',
    locationPlaceholder: 'Enter your city or district',
    note: 'Requirements can change by state, local authority, business activity, and applicant type. The service desk will confirm the final checklist before filing.',
    nextSteps: ['Confirm the city or district', 'Tell us the business activity', 'Keep identity and address proof ready'],
  },
};

export function getStateIntakeGuidance(state: string) {
  return STATE_INTAKE_GUIDANCE[state] || STATE_INTAKE_GUIDANCE.default;
}
