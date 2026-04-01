export interface CountryData {
  country: string;
  koreanName: string;
  cities: string[];
}

export async function fetchCountriesData(): Promise<CountryData[]> {
  try {
    const [resCities, resIso] = await Promise.all([
      fetch('https://countriesnow.space/api/v0.1/countries').then(r => r.json()),
      fetch('https://countriesnow.space/api/v0.1/countries/iso').then(r => r.json())
    ]);

    if (!resCities.error && !resIso.error) {
       const isoMap = new Map<string, string>();
       // Iso 배열을 순회하며 영문 국가명과 ISO2 매핑
       resIso.data.forEach((d: {name: string, Iso2: string}) => {
          isoMap.set(d.name, d.Iso2);
       });

       // 브라우저 지역 이름 번역기 객체 초기화 (한국어)
       const regionNames = new Intl.DisplayNames(['ko'], { type: 'region' });

       return resCities.data.map((d: {country: string, cities: string[]}) => {
          const iso2 = isoMap.get(d.country) || '';
          let koreanName = d.country; // 변환 실패 대비 원문 유지
          if (iso2) {
            try {
               koreanName = regionNames.of(iso2) || d.country;
            } catch (e) {
               koreanName = d.country;
            }
          }
          return {
             country: d.country, // 영문 원문 (Google Maps/API 용)
             koreanName,         // UI 노출용 한글
             cities: d.cities
          };
       });
    }
    return [];
  } catch (err) {
    console.error('API Error:', err);
    return [];
  }
}
