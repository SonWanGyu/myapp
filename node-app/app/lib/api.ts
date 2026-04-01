export interface CountryData {
  country: string;
  cities: string[];
}

export async function fetchCountriesData(): Promise<CountryData[]> {
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries');
    if (!res.ok) throw new Error('Failed to fetch countries');
    const json = await res.json();
    if (!json.error) {
       return json.data as CountryData[];
    }
    return [];
  } catch (err) {
    console.error('API Error:', err);
    return [];
  }
}
