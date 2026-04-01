'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { TRAVEL_DESTINATIONS, CONTINENTS, TravelDestination } from '../lib/travelData';

interface PlanDay {
  day: string;
  places: { name: string; description: string }[];
}

interface PlanResult {
  title: string;
  days: PlanDay[];
}

export default function PlannerPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'AUTO' | 'MANUAL' | null>(null);

  // States
  const allData: TravelDestination[] = TRAVEL_DESTINATIONS;
  const [autoLocation, setAutoLocation] = useState('');
  
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [headcount, setHeadcount] = useState<number>(1);
  const [companion, setCompanion] = useState('');
  const [travelStyles, setTravelStyles] = useState<string[]>([]);

  // Search terms
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [activeCountry, setActiveCountry] = useState('');

  // Result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string>('');

  useEffect(() => {
    // Moved metadata to local curated travelData.ts
  }, []);

  const resetFromStep = (targetStep: number) => {
    if (targetStep <= 1) {
      setMode(null);
      setAutoLocation('');
      setSelectedCountries([]);
      setSelectedCities([]);
      setActiveCountry('');
    }
    if (targetStep <= 5) {
      setStartDate('');
      setEndDate('');
    }
    if (targetStep <= 6) {
      setHeadcount(1);
    }
    if (targetStep <= 7) {
      setCompanion('');
    }
    if (targetStep <= 8) {
      setTravelStyles([]);
    }
    setResult(null);
    setStep(targetStep);
  };

  const handleCreatePlan = async () => {
    if (!isAuthenticated) {
        alert('로그인이 필요한 기능입니다.');
        router.push('/login');
        return;
    }

    setLoading(true);
    setStep(9); // Loading / Result view
    
    // API 호출
    const payload = {
      mode,
      countries: mode === 'AUTO' ? [autoLocation] : selectedCountries,
      cities: mode === 'AUTO' ? [] : selectedCities,
      startDate,
      endDate,
      headCount: headcount,
      companions: companion,
      travelStyles
    };

    try {
      const apiUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/planner/generate`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('AI 생성 실패');
      
      const jsonStr = await res.json();
      try {
        const parsed = JSON.parse(jsonStr.resultJson);
        setResult(parsed as PlanResult);
      } catch (parseEr) {
        console.error(parseEr);
        alert('AI가 비정상적인 데이터를 반환했습니다.');
        setStep(8);
      }
    } catch (err) {
      console.error(err);
      alert('일정 생성 중 오류가 발생했습니다.');
      setStep(8);
    } finally {
      setLoading(false);
    }
  };

  const saveToMyItinerary = async () => {
    if (!result) return;
    try {
       const apiUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8080/api/itineraries`;
       const payload = {
           title: result.title,
           startDate,
           endDate,
           scheduleJson: JSON.stringify(result)
       };
       const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('내 일정에 담겼습니다!');
        router.push('/my-itinerary');
      } else {
        alert('저장 실패!');
      }
    } catch (e) {
      console.error(e);
      alert('저장 오류');
    }
  };

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter(c => c !== country));
      // Remove related cities
      const countryCities = allData.find(d => d.country === country)?.cities || [];
      setSelectedCities(selectedCities.filter(city => !countryCities.includes(city)));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const toggleStyle = (style: string) => {
    if (travelStyles.includes(style)) {
      setTravelStyles(travelStyles.filter(s => s !== style));
    } else {
      setTravelStyles([...travelStyles, style]);
    }
  };

  return (
    <div className="container animate-fade-in">
      <h2 className="page-title center mb-4">✨ AI 일정 만들기</h2>
      
      {step < 9 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
          {[1,2,3,4,5,6,7,8].map(s => {
            // mode='AUTO' 일 때 3, 4 스킵
            if (mode === 'AUTO' && (s===3 || s===4)) return null;
            // mode='MANUAL' 일 때 2 스킵
            if (mode === 'MANUAL' && s===2) return null;
            
            return (
              <button 
                key={s} 
                onClick={() => resetFromStep(s)} 
                className={step === s ? 'primary' : 'secondary'}
                style={{ opacity: step >= s ? 1 : 0.5, pointerEvents: step >= s ? 'auto' : 'none', flexShrink: 0 }}
              >
                Step {s}
              </button>
            )
          })}
        </div>
      )}

      <div className="card">
        {step === 1 && (
          <div>
            <h3>여행 방식 결정을 도와드릴게요!</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="primary" style={{ flex: 1, padding: '2rem' }} onClick={() => { setMode('AUTO'); setStep(2); }}>
                🤖 모든 계획을 AI에게 맡기기
              </button>
              <button className="secondary" style={{ flex: 1, padding: '2rem' }} onClick={() => { setMode('MANUAL'); setStep(3); }}>
                🗺️ 내가 직접 선택하기
              </button>
            </div>
          </div>
        )}

        {step === 2 && mode === 'AUTO' && (
          <div>
            <h3>어디로 떠나고 싶으신가요? (대륙 또는 나라를 선택하거나 직접 입력하세요)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
              {CONTINENTS.map(c => (
                <button 
                  key={c} 
                  className={autoLocation === c ? 'primary' : 'secondary'} 
                  onClick={() => setAutoLocation(c)}
                  style={{ borderRadius: '20px' }}
                >
                  {c}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="직접 입력 (예: 유럽, 동남아, 스위스...)" 
              value={autoLocation} 
              onChange={e => setAutoLocation(e.target.value)} 
            />
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => setStep(5)} disabled={!autoLocation}>확인</button>
            </div>
          </div>
        )}

        {step === 3 && mode === 'MANUAL' && (
          <div>
            <h3>여행할 국가들을 선택해주세요. (중복 가능)</h3>
            <input type="text" placeholder="국가 검색..." value={countrySearch} onChange={e => setCountrySearch(e.target.value.toLowerCase())} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {allData.filter(d => d.country.toLowerCase().includes(countrySearch)).map(d => (
                <button 
                  key={d.country} 
                  className={selectedCountries.includes(d.country) ? 'primary' : 'secondary'}
                  onClick={() => toggleCountry(d.country)}
                  style={{ borderRadius: '20px' }}
                >
                  {d.country}
                </button>
              ))}
            </div>
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => setStep(4)} disabled={selectedCountries.length === 0}>다음</button>
            </div>
          </div>
        )}

        {step === 4 && mode === 'MANUAL' && (
          <div>
            <h3>방문하실 도시를 선택해주세요.</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {selectedCountries.map(c => (
                <button 
                  key={c} 
                  className={activeCountry === c ? 'primary' : 'secondary'} 
                  onClick={() => setActiveCountry(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            {activeCountry ? (
               <div>
                  <input type="text" placeholder={`${activeCountry} 내 도시 검색...`} value={citySearch} onChange={e => setCitySearch(e.target.value.toLowerCase())} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {allData.find(d => d.country === activeCountry)?.cities.filter(c => c.toLowerCase().includes(citySearch)).map(c => (
                      <button 
                        key={c} 
                        className={selectedCities.includes(c) ? 'primary' : 'secondary'}
                        onClick={() => toggleCity(c)}
                        style={{ borderRadius: '20px' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
               </div>
            ) : (
                <p className="text-muted">위에서 국가를 선택하여 하위 도시를 조회하세요.</p>
            )}
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => setStep(5)} disabled={selectedCities.length === 0}>다음</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3>언제 출발하시나요?</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="date" 
                value={startDate} 
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setStartDate(e.target.value)} 
              />
              <span style={{ alignSelf: 'center' }}>~</span>
              <input 
                type="date" 
                value={endDate} 
                min={startDate || new Date().toISOString().split('T')[0]} 
                onChange={e => setEndDate(e.target.value)} 
              />
            </div>
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => setStep(6)} disabled={!startDate || !endDate}>다음</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h3>총 몇 명에서 떠나시나요?</h3>
            <input type="number" min={1} max={50} value={headcount} onChange={e => setHeadcount(Number(e.target.value))} />
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => setStep(7)} disabled={headcount < 1}>다음</button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h3>누구와 함께 가나요?</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['혼자', '배우자와', '연인과', '친구와', '아이와', '부모님과', '기타'].map(c => (
                <button 
                  key={c} 
                  className={companion === c ? 'primary' : 'secondary'} 
                  onClick={() => setCompanion(c)}
                  style={{ borderRadius: '20px', padding: '10px 20px' }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => setStep(8)} disabled={!companion}>다음</button>
            </div>
          </div>
        )}

        {step === 8 && (
          <div>
            <h3>원하시는 여행 테마(스타일)를 골라주세요. (다중 선택)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['휴양', '액티비티', '먹방', '쇼핑', '자연', '유명 관광지', '역사/문화'].map(s => (
                <button 
                  key={s} 
                  className={travelStyles.includes(s) ? 'primary' : 'secondary'} 
                  onClick={() => toggleStyle(s)}
                  style={{ borderRadius: '20px', padding: '10px 20px' }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="form-actions mt-5 flex-between">
               <span className="text-muted">선택이 모두 끝났습니다!</span>
               <button className="primary" onClick={handleCreatePlan} disabled={travelStyles.length === 0} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
                 ✨ 일정 만들기 (AI 생성)
               </button>
            </div>
          </div>
        )}

        {step === 9 && loading && (
          <div className="text-center p-3">
             <h2>🤖 AI가 일정을 짜고 있어요...</h2>
             <p className="text-muted">보통 10~20초 정도 소요됩니다. 조금만 기다려주세요!</p>
          </div>
        )}

        {step === 9 && !loading && result && (
          <div>
            <div className="flex-between mb-4">
              <h2 style={{ color: 'var(--primary)', margin: 0 }}>{result.title}</h2>
              <button className="primary" onClick={saveToMyItinerary}>📥 내 일정에 담기</button>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
               <div style={{ flex: 1, maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                 {result.days.map((d, i) => (
                   <div key={i} style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                     <h3 style={{ marginTop: 0, color: '#0f172a' }}>{d.day}</h3>
                     {d.places.map((p, j) => (
                       <div key={j} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onClick={() => setSelectedPlace(p.name)}>
                          <strong style={{ display: 'block', color: 'var(--primary)' }}>📍 {p.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.9rem' }}>{p.description}</span>
                       </div>
                     ))}
                   </div>
                 ))}
               </div>

               <div style={{ flex: 1, position: 'sticky', top: '100px' }}>
                 {selectedPlace ? (
                   <iframe
                     width="100%"
                     height="500"
                     style={{ border: 0, borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                     loading="lazy"
                     allowFullScreen
                     src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(selectedPlace)}`}
                   ></iframe>
                 ) : (
                   <div style={{ height: '500px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                     좌측 목록에서 장소를 클릭하면<br />여기에 지도가 표시됩니다.
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
