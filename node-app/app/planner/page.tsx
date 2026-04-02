'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { CONTINENTS, TRAVEL_DESTINATIONS, TravelDestination } from '../lib/travelData';
import { useAlert } from '../context/AlertContext';

interface Place {
  name: string;
  description: string;
  lat?: number;
  lng?: number;
}

interface PlanDay {
  day: string;
  places: Place[];
}

interface PlanResult {
  title: string;
  days: PlanDay[];
}

// 두 좌표 간 거리 계산 (km)
function calcDistance(lat1?: number, lng1?: number, lat2?: number, lng2?: number): string {
  if (!lat1 || !lng1 || !lat2 || !lng2) return '';
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
}

function extractSearchName(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  if (match) return match[1].trim();
  return name;
}

function getMapSrc(p: Place, fallback: string) {
  const searchName = extractSearchName(p.name || fallback);
  // 좌표가 0,0이거나 없으면 이름으로만 검색
  if (!p.lat || !p.lng || (p.lat === 0 && p.lng === 0)) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(searchName)}&z=16&ie=UTF8&iwloc=B&output=embed`;
  }
  // 좌표가 있더라도 이름과 함께 검색해야 핀이 더 정확함
  return `https://maps.google.com/maps?q=${p.lat},${p.lng}+(${encodeURIComponent(searchName)})&z=16&ie=UTF8&iwloc=B&output=embed`;
}

export default function PlannerPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();

  const { showAlert, showConfirm } = useAlert();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'AUTO' | 'MANUAL' | null>(null);

  // States
  const allData: TravelDestination[] = TRAVEL_DESTINATIONS;
  const [autoLocation, setAutoLocation] = useState('');
  const [autoCountry, setAutoCountry] = useState('');
  
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
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  useEffect(() => {
    // 모든 데이터는 로컬 빅데이터를 직접 사용 (더 이상 API 비동기 지연 없음)
  }, []);

  const resetFromStep = (targetStep: number) => {
    if (targetStep <= 1) {
      setMode(null);
      setAutoLocation('');
      setAutoCountry('');
      setSelectedCountries([]);
      setSelectedCities([]);
      setActiveCountry('');
    }
    if (targetStep <= 3) {
      // Step 3으로 가거나 그 이전일 때 찌꺼기 완벽 삭제
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
        showAlert('로그인이 필요한 기능입니다.');
        router.push('/login');
        return;
    }

    setLoading(true);
    setStep(9); // Loading / Result view
    
    const payloadCountries = mode === 'AUTO' 
        ? (autoCountry ? [autoCountry] : [autoLocation]) 
        : selectedCountries;

    // API 호출
    const payload = {
      mode,
      countries: payloadCountries,
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
      
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `AI 통신 실패 (상태 코드: ${res.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText ? `서버 에러: ${errorText}` : errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const jsonStr = await res.json();
      try {
        const parsed = JSON.parse(jsonStr.resultJson);
        setResult(parsed as PlanResult);
      } catch (parseEr) {
        console.error(parseEr);
        showAlert('AI가 비정상적인 데이터를 반환했습니다.');
        setStep(8);
      }
    } catch (err) {
      console.error(err);
      showAlert(`일정 생성 중 오류가 발생했습니다.\n상세: ${(err as Error).message}`);
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
      if (res.status === 401) return; // 인증 만료/로그아웃 시 알림 없이 리다이렉트 대기
      if (res.ok) {
        showAlert('내 일정에 담겼습니다!');
        router.push('/my-itinerary');
      } else {
        showAlert('저장 실패!');
      }
    } catch (e) {
      console.error(e);
      showAlert('저장 오류');
    }
  };

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter(c => c !== country));
      // 언셀렉트 시 해당 국가에 속한 도시 전체 삭제
      const countryObj = allData.find(d => d.country === country);
      const countryCities = countryObj?.cities || [];
      setSelectedCities(prev => prev.filter(city => !countryCities.includes(city)));
      if (activeCountry === country) setActiveCountry('');
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
            <h3>어디로 떠나고 싶으신가요? (대륙 선택)</h3>
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
            
            <h4 className="mt-4">구체적인 국가 선택 (선택사항)</h4>
            <select 
              className="mt-2" 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              value={autoCountry}
              onChange={e => setAutoCountry(e.target.value)}
            >
              <option value="">국가 미지정 (AI가 자유롭게 추천해 줍니다!)</option>
              {allData.filter(d => !autoLocation || d.continent === autoLocation).map(d => (
                <option key={d.country} value={d.country}>
                  {d.country}
                </option>
              ))}
            </select>

            <div className="form-actions mt-4">
              <button className="primary" onClick={() => {
                if (!autoLocation && !autoCountry) { showAlert('대륙 또는 국가를 하나 이상 선택해주세요.'); return; }
                setStep(5);
              }}>다음</button>
            </div>
          </div>
        )}

        {step === 3 && mode === 'MANUAL' && (
          <div>
            <h3>여행할 국가들을 선택해주세요. (중복 가능)</h3>
            <input type="text" placeholder="국가 검색..." value={countrySearch} onChange={e => setCountrySearch(e.target.value.toLowerCase())} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {allData.filter(d => d.country.includes(countrySearch)).map(d => {
                return (
                  <button 
                    key={d.country} 
                    className={selectedCountries.includes(d.country) ? 'primary' : 'secondary'}
                    onClick={() => toggleCountry(d.country)}
                    style={{ borderRadius: '20px' }}
                  >
                    {d.country}
                  </button>
                );
              })}
            </div>
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => {
                if (selectedCountries.length === 0) { showAlert('최소 1개 이상의 국가를 선택해주세요.'); return; }
                setStep(4);
              }}>다음</button>
            </div>
          </div>
        )}

        {step === 4 && mode === 'MANUAL' && (
          <div>
            <h3>방문하실 도시를 선택해주세요.</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {selectedCountries.map(c => (
                <button 
                  key={c} 
                  className={activeCountry === c ? 'primary' : 'secondary'} 
                  onClick={() => setActiveCountry(c)}
                  style={{ borderRadius: '20px' }}
                >
                  {c}
                </button>
              ))}
            </div>
            {activeCountry ? (
               <div>
                  <input type="text" placeholder={`${activeCountry} 내 도시 검색...`} value={citySearch} onChange={e => setCitySearch(e.target.value.toLowerCase())} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {allData.find(d => d.country === activeCountry)?.cities.filter(c => c.includes(citySearch)).map(c => (
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
                <p className="text-muted">위에서 국가 버튼을 클릭하여 소속 도시를 확인하세요.</p>
            )}
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => {
                if (selectedCities.length === 0) { showAlert('최소 1개 이상의 도시를 선택해주세요.'); return; }
                setStep(5);
              }}>다음</button>
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
              <button className="primary" onClick={() => {
                if (!startDate || !endDate) { showAlert('출발일과 종료일을 정확히 선택해주세요.'); return; }
                setStep(6);
              }}>다음</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h3>총 몇 명에서 떠나시나요?</h3>
            <input type="number" min={1} max={50} value={headcount} onChange={e => setHeadcount(Number(e.target.value))} />
            <div className="form-actions mt-3">
              <button className="primary" onClick={() => {
                if (headcount < 1) { showAlert('인원수는 최소 1명 이상이어야 합니다.'); return; }
                setStep(7);
              }}>다음</button>
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
              <button className="primary" onClick={() => {
                if (!companion) { showAlert('동행자를 선택해주세요.'); return; }
                setStep(8);
              }}>다음</button>
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
               <button className="primary" onClick={() => {
                 if (travelStyles.length === 0) { showAlert('여행 테마를 최소 1개 이상 골라주세요.'); return; }
                 handleCreatePlan();
               }} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
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

        {step === 9 && !loading && result && (() => {
          const activeDay = result.days[selectedDayIdx] || result.days[0];
          return (
           <div>
             {/* 헤더 - 여행 타이틀 */}
             <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
               <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌍</div>
               <h2 style={{ color: '#1e293b', margin: '0 0 0.3rem 0', fontSize: '1.6rem' }}>{result.title}</h2>
               <p className="text-muted" style={{ margin: 0 }}>AI가 추천해 준 맞춤 일정으로 여행을 떠나보세요.</p>
             </div>

             {/* 지도 */}
             <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
               {(() => {
                 const mp = activeDay.places.find(p => p.name === selectedPlace) || activeDay.places[0];
                 const src = mp ? getMapSrc(mp, result.title) : `https://maps.google.com/maps?q=${encodeURIComponent(result.title)}&z=13&output=embed`;
                 return <iframe width="100%" height="300" style={{ border: 0, display: 'block' }} loading="lazy" allowFullScreen src={src} />;
               })()}
             </div>

             {/* Day 탭 */}
             <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
               {result.days.map((d, i) => (
                 <button
                   key={i}
                   onClick={() => { setSelectedDayIdx(i); setSelectedPlace(''); }}
                   style={{
                     padding: '8px 20px',
                     borderRadius: '20px',
                     border: selectedDayIdx === i ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                     backgroundColor: selectedDayIdx === i ? 'var(--primary)' : '#fff',
                     color: selectedDayIdx === i ? '#fff' : '#64748b',
                     fontWeight: selectedDayIdx === i ? '700' : '500',
                     cursor: 'pointer',
                     fontSize: '0.9rem',
                     whiteSpace: 'nowrap',
                     transition: 'all 0.2s',
                     flexShrink: 0,
                   }}
                 >
                   {d.day}
                 </button>
               ))}
             </div>

             {/* 타임라인 장소 카드 */}
             <div style={{ position: 'relative', paddingLeft: '40px' }}>
               {/* 타임라인 세로선 */}
               <div style={{
                 position: 'absolute', left: '18px', top: '0', bottom: '0', width: '2px',
                 background: 'linear-gradient(to bottom, var(--primary), #c7d2fe)', borderRadius: '2px'
               }} />
               
               {activeDay.places.map((p, j) => {
                 const dist = j > 0 ? calcDistance(activeDay.places[j-1].lat, activeDay.places[j-1].lng, p.lat, p.lng) : '';
                 return (<>
                 {dist && (
                   <div style={{
                     display: 'flex', alignItems: 'center', gap: '6px',
                     padding: '4px 0', color: '#94a3b8', fontSize: '0.72rem',
                   }}>
                     <div style={{ width: '16px', borderTop: '1px dashed #cbd5e1' }} />
                     <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>
                       🚶 {dist}
                     </span>
                   </div>
                 )}
                 <div key={j} style={{ position: 'relative', marginBottom: '8px' }}>
                   {/* 번호 원 */}
                   <div style={{
                     position: 'absolute', left: '-40px', top: '10px', width: '26px', height: '26px',
                     borderRadius: '50%', backgroundColor: selectedPlace === p.name ? 'var(--primary)' : '#818cf8',
                     color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                     fontSize: '0.75rem', fontWeight: '700', zIndex: 1,
                     boxShadow: '0 2px 6px rgba(99,102,241,0.4)',
                     transition: 'all 0.2s'
                   }}>
                     {j + 1}
                   </div>
                   
                   {/* 장소 카드 */}
                   <div
                     onClick={() => setSelectedPlace(p.name)}
                     style={{
                       padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                       backgroundColor: selectedPlace === p.name ? '#eef2ff' : '#fff',
                       border: selectedPlace === p.name ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                       boxShadow: selectedPlace === p.name ? '0 4px 12px rgba(99,102,241,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                       transition: 'all 0.2s',
                       wordBreak: 'keep-all'
                     }}
                   >
                     <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.95rem', marginBottom: '3px' }}>
                       {p.name}
                     </strong>
                     <span style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>{p.description}</span>
                     {selectedPlace === p.name && (
                       <div style={{ marginTop: '6px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600' }}>
                         📍 지도에서 보기
                       </div>
                     )}
                   </div>
                 </div>
                 </>);
               })}
             </div>

             {/* 내 일정에 담기 플로팅 버튼 */}
             <div style={{ position: 'sticky', bottom: '20px', textAlign: 'center', marginTop: '2rem', zIndex: 10 }}>
               <button
                 className="primary"
                 onClick={saveToMyItinerary}
                 style={{
                   padding: '14px 40px', fontSize: '1.1rem', borderRadius: '50px',
                   boxShadow: '0 6px 24px rgba(99,102,241,0.4)',
                   display: 'inline-flex', alignItems: 'center', gap: '8px'
                 }}
               >
                 📥 내 일정으로 담기
               </button>
             </div>
           </div>
          );
        })()}
      </div>
    </div>
  );
}
