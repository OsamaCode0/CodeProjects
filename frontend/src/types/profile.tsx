export type MeResponse = {
  name?: string | null;
  gender?: string | null;
  about?: string | null;
  languages?: string[] | null;
  addressCity?: string | null;
  lat?: number | null;
  lon?: number | null;
  preferredDistance?:number | null;
};

export type City = {
  label: string;
  countryCode?: string;
  lat: number;
  lon: number;
};

export type BioResponse = {
  gender?: string | null;
  prefferedDistance?: number | null;
};

export type CombinedMe = MeResponse & BioResponse;
