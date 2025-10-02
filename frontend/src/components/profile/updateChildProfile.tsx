
export type ChildFields = {
  name: string;
  birthday: string;              
  gender: string;
  about_short: string;
  interests: string[];
  activity_level: string;
  limitations: string[];
  allergies: string[];        
  play_styles: string[];
};


const trimEq = (a: string, b: string) => a.trim() === b.trim();

const arrNormalize = (arr: string[]) =>
  arr.map(s => s.trim()).filter(Boolean);

const arrEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);


export function buildChildPayload(
  current: ChildFields,
  original: ChildFields
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  // Scalars
  if (!trimEq(current.name, original.name)) payload.name = current.name.trim();
  if (current.birthday !== original.birthday) payload.birthday = current.birthday; // assume valid YYYY-MM-DD
  if (current.gender !== original.gender) payload.gender = current.gender;
  if (!trimEq(current.about_short, original.about_short)) payload.about_short = current.about_short.trim();
  if (current.activity_level !== original.activity_level) payload.activity_level = current.activity_level;

  // Arrays (normalized)
  const interestsNow = arrNormalize(current.interests);
  const interestsOld = arrNormalize(original.interests);
  if (!arrEqual(interestsNow, interestsOld)) payload.interests = interestsNow;

  const limitationsNow = arrNormalize(current.limitations);
  const limitationsOld = arrNormalize(original.limitations);
  if (!arrEqual(limitationsNow, limitationsOld)) payload.limitations = limitationsNow;

  const allergiesNow = arrNormalize(current.allergies);
  const allergiesOld = arrNormalize(original.allergies);
  if (!arrEqual(allergiesNow, allergiesOld)) payload.allergies = allergiesNow;

  const playNow = arrNormalize(current.play_styles);
  const playOld = arrNormalize(original.play_styles);
  if (!arrEqual(playNow, playOld)) payload.play_styles = playNow;

  return payload;
}
