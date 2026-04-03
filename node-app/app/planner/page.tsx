'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { CONTINENTS, TRAVEL_DESTINATIONS, TravelDestination } from '../lib/travelData';
import { useAlert } from '../context/AlertContext';
import { Place, PlanDay, PlanResult } from '../types';

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

// 여행 제목([후쿠오카] 등)에서 도시 힌트를 추출하는 함수
function extractCityHint(title: string): string {
  const match = title.match(/\[([^\]]+)\]/) || title.match(/^([^\s&]+)/);
  return match ? match[1] : '';
}

function getMapSrc(p: Place, fallback: string) {
  const searchName = extractSearchName(p.name);
  const cityHint = extractCityHint(fallback);
  const query = encodeURIComponent(`${searchName} ${cityHint}`.trim());
  
  // iwloc=A 를 사용하여 정보창이 더욱 강력하게 열려있도록 설정합니다.
  return `https://maps.google.com/maps?q=${query}&z=15&ie=UTF8&iwloc=A&output=embed`;
}

function getGoogleMapsSearchLink(p: Place, fallback: string) {
  const searchName = extractSearchName(p.name);
  const cityHint = extractCityHint(fallback);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${searchName} ${cityHint}`.trim())}`;
}

// 로딩 진행바 컴포넌트
function LoadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(timer);
          return 95;
        }
        const inc = Math.max(0.5, (100 - prev) / 20);
        return prev + inc;
      });
    }, 150);
    
    // 마침표 애니메이션
    const dotsTimer = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(dotsTimer);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-text">
        {progress < 30 && `지형 정보를 분석하고 있어요${dots}`}
        {progress >= 30 && progress < 60 && `최적의 경로를 계산 중입니다${dots}`}
        {progress >= 60 && progress < 90 && `장소별 상세 일정을 다듬고 있어요${dots}`}
        {progress >= 90 && `마무리 최적화 중${dots} 잠시만요!`}
      </p>
    </div>
  );
}

export default function PlannerPage() {
  const { isAuthenticated } = useAuth();
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
  const [tempo, setTempo] = useState<'BUSY' | 'RELAX' | null>(null);

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
    // 로그인 시 보관된 '임시 일정'이 있으면 자동 저장 시도
    if (isAuthenticated) {
      const pending = localStorage.getItem('pending_itinerary');
      if (pending) {
        const performAutoSave = async () => {
          try {
            const data = JSON.parse(pending);
            const apiUrl = `http://${window.location.hostname}:8080/api/itineraries`;
            const res = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(data)
            });
            if (res.ok) {
              localStorage.removeItem('pending_itinerary');
              showAlert('보관 중이던 일정이 자동으로 저장되었습니다!');
              router.push('/my-itinerary');
            }
          } catch (e) {
            console.error('Auto-save error:', e);
          }
        };
        performAutoSave();
      }
    }
  }, [isAuthenticated, router, showAlert]);

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
      setTempo(null);
    }
    if (targetStep <= 9) {
       setResult(null);
    }
    setStep(targetStep);
  };

  const handleCreatePlan = async () => {
    setLoading(true);
    setStep(10); // 결과 및 로딩 단계(Step 10)로 이동
    setResult(null);
    
    const payload = {
      mode,
      countries: mode === 'AUTO' ? [autoCountry] : selectedCountries,
      cities: selectedCities,
      startDate,
      endDate,
      headCount: headcount,
      companions: companion,
      travelStyles,
      tempo
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
        setStep(9);
      }
    } catch (err) {
      console.error(err);
      showAlert(`일정 생성 중 오류가 발생했습니다.\n상세: ${(err as Error).message}`);
      setStep(9); // 오류 시 다시 선택 단계(Step 9)로 복귀
    } finally {
      setLoading(false);
    }
  };

  const saveToMyItinerary = async () => {
    if (!result) return;

    if (!isAuthenticated) {
      // 비로그인 상태: 현재 일정 보관 후 로그인 페이지로 유도
      const pending = {
        title: result.title,
        startDate,
        endDate,
        scheduleJson: JSON.stringify(result)
      };
      localStorage.setItem('pending_itinerary', JSON.stringify(pending));
      showAlert('일정을 저장하려면 로그인이 필요합니다. 로그인 후 자동으로 저장됩니다.');
      router.push('/login?redirect=/planner');
      return;
    }

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
      
      {step < 10 && (
        <div className="planner-step-nav">
          {[1,2,3,4,5,6,7,8,9].map(s => {
            // mode='AUTO' 일 때 3, 4 스킵
            if (mode === 'AUTO' && (s===3 || s===4)) return null;
            // mode='MANUAL' 일 때 2 스킵
            if (mode === 'MANUAL' && s===2) return null;
            
            return (
              <button 
                key={s} 
                onClick={() => resetFromStep(s)} 
                className={`${step === s ? 'primary' : 'secondary'} step-btn ${step >= s ? 'step-active' : 'step-disabled'}`}
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
            <div className="mode-selection-container">
              <button className="primary mode-btn" onClick={() => { setMode('AUTO'); setStep(2); }}>
                🤖 모든 계획을 AI에게 맡기기
              </button>
              <button className="secondary mode-btn" onClick={() => { setMode('MANUAL'); setStep(3); }}>
                🗺️ 내가 직접 선택하기
              </button>
            </div>
          </div>
        )}

        {step === 2 && mode === 'AUTO' && (
          <div>
            <h3>어디로 떠나고 싶으신가요? (대륙 선택)</h3>
            <div className="flex-wrap flex-gap-10 mb-1">
              {CONTINENTS.map(c => (
                <button 
                  key={c} 
                  className={`${autoLocation === c ? 'primary' : 'secondary'} br-20`} 
                  onClick={() => setAutoLocation(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            
            <h4 className="mt-2">구체적인 국가 선택 (선택사항)</h4>
            <select 
              className="mt-1 w-full p-1 br-8 border-ccc" 
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

            <div className="form-actions mt-2">
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
            <div className="search-input-group">
              <input type="text" placeholder="국가 검색..." value={countrySearch} onChange={e => setCountrySearch(e.target.value.toLowerCase())} />
            </div>
            <div className="chip-container-scroll">
              {allData.filter(d => d.country.includes(countrySearch)).map(d => {
                return (
                  <button 
                    key={d.country} 
                    className={`${selectedCountries.includes(d.country) ? 'primary' : 'secondary'} br-20`}
                    onClick={() => toggleCountry(d.country)}
                  >
                    {d.country}
                  </button>
                );
              })}
            </div>
            <div className="form-actions mt-1">
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
            <div className="flex-wrap flex-gap-8 mb-1">
              {selectedCountries.map(c => (
                <button 
                  key={c} 
                  className={`${activeCountry === c ? 'primary' : 'secondary'} br-20`} 
                  onClick={() => setActiveCountry(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            {activeCountry ? (
               <div>
                  <div className="search-input-group">
                    <input type="text" placeholder={`${activeCountry} 내 도시 검색...`} value={citySearch} onChange={e => setCitySearch(e.target.value.toLowerCase())} />
                  </div>
                  <div className="chip-container-scroll">
                    {allData.find(d => d.country === activeCountry)?.cities.filter(c => c.includes(citySearch)).map(c => (
                      <button 
                        key={c} 
                        className={`${selectedCities.includes(c) ? 'primary' : 'secondary'} br-20`}
                        onClick={() => toggleCity(c)}
                      >
                        {c}
                      </button>
                     ))}
                  </div>
               </div>
            ) : (
                <p className="text-muted">위에서 국가 버튼을 클릭하여 소속 도시를 확인하세요.</p>
            )}
            <div className="form-actions mt-1">
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
            <div className="date-input-group">
              <input 
                type="date" 
                value={startDate} 
                className="flex-1"
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setStartDate(e.target.value)} 
              />
              <span>~</span>
              <input 
                type="date" 
                value={endDate} 
                className="flex-1"
                min={startDate || new Date().toISOString().split('T')[0]} 
                onChange={e => setEndDate(e.target.value)} 
              />
            </div>
            <div className="form-actions mt-1">
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
            <div className="form-actions mt-1">
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
            <div className="flex-wrap flex-gap-10">
              {['혼자', '배우자와', '연인과', '친구와', '아이와', '부모님과', '기타'].map(c => (
                <button 
                  key={c} 
                  className={`${companion === c ? 'primary' : 'secondary'} br-20 p-1`} 
                  onClick={() => setCompanion(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="form-actions mt-1">
              <button className="primary" onClick={() => {
                if (!companion) { showAlert('동행자를 선택해주세요.'); return; }
                setStep(8);
              }}>다음</button>
            </div>
          </div>
        )}

        {step === 8 && (
          <div>
            <h3>원하시는 여행 테마(스타일)를 골라주세요.</h3>
            <div className="flex-wrap flex-gap-10">
              {['휴양', '액티비티', '먹방', '쇼핑', '자연', '유명 관광지', '역사/문화'].map(s => (
                <button 
                  key={s} 
                  className={`${travelStyles.includes(s) ? 'primary' : 'secondary'} br-20 p-1`} 
                  onClick={() => toggleStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="form-actions mt-2">
               <button className="primary" onClick={() => {
                 if (travelStyles.length === 0) { showAlert('여행 테마를 최소 1개 이상 골라주세요.'); return; }
                 setStep(9);
               }}>다음</button>
            </div>
          </div>
        )}

        {step === 9 && (
          <div>
            <h3>여행의 템포를 결정해주세요.</h3>
            <div className="tempo-btn-container">
              <button 
                className={`${tempo === 'BUSY' ? 'primary' : 'secondary'} tempo-btn`} 
                onClick={() => setTempo('BUSY')}
              >
                🏃 여행간김에 부지런히<br/>
                <span className="tempo-hint">(빽빽한 일정 선호)</span>
              </button>
              <button 
                className={`${tempo === 'RELAX' ? 'primary' : 'secondary'} tempo-btn`} 
                onClick={() => setTempo('RELAX')}
              >
                🧘 여행은 쉬러 가는거지<br/>
                <span className="tempo-hint">(여유로운 휴식 선호)</span>
              </button>
            </div>
            <div className="form-actions mt-2 flex-between">
               <span className="text-muted">마지막 단계입니다!</span>
               <button className="primary p-2 br-12" onClick={() => {
                 if (!tempo) { showAlert('여행 템포를 선택해주세요.'); return; }
                 handleCreatePlan();
               }}>
                 ✨ 일정 만들기 (AI 생성)
               </button>
            </div>
          </div>
        )}

        {step === 10 && loading && (
          <div className="text-center p-5 animate-fade-in">
             <div className="fs-4-rem mb-line">🤖</div>
             <h2>AI가 일정의 밀도를 조절하고 있어요...</h2>
             <p className="text-muted">보통 10~20초 정도 소요됩니다. 조금만 기다려주세요!</p>
             
             {/* 진행바 추가 */}
             <LoadingProgressBar />
          </div>
        )}

        {step === 10 && !loading && result && (() => {
          const activeDay = result.days[selectedDayIdx] || result.days[0];
          return (
            <div className="animate-fade-in">
              {/* 헤더 - 여행 타이틀 */}
             <div className="result-header-visual">
               <div className="result-icon-lg">🌍</div>
               <h2 className="m-0 fs-1-6 color-slate-800">{result.title}</h2>
               <p className="text-muted m-0">AI가 추천해 준 맞춤 일정으로 여행을 떠나보세요.</p>
             </div>

              {/* 지도 영역 */}
              <div className="map-card-wrapper">
                {(() => {
                  const mp = activeDay.places.find(p => p.name === selectedPlace) || activeDay.places[0];
                  const src = mp ? getMapSrc(mp, result.title) : `https://maps.google.com/maps?q=${encodeURIComponent(result.title)}&z=13&output=embed`;
                  return <iframe width="100%" height="350" className="border-none block" loading="lazy" allowFullScreen src={src} />;
                })()}
              </div>

              {/* 하단 상세 정보 영역 (스크린샷 스타일 반영) */}
              <div className="p-1 br-16 bg-slate-50 border-slate-200">
                {/* Day 탭 */}
                <div className="day-tab-container">
                  {result.days.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedDayIdx(i); setSelectedPlace(''); }}
                      className={`day-tab-btn ${selectedDayIdx === i ? 'primary' : 'secondary border-slate-200 color-slate-500 bg-white shadow-none'}`}
                      style={selectedDayIdx !== i ? { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b' } : {}}
                    >
                      {d.day}
                    </button>
                  ))}
                </div>

                {/* 선택된 장소 상세 정보 카드 */}
                {(() => {
                  const mp = activeDay.places.find(p => p.name === selectedPlace) || activeDay.places[0];
                  if (!mp) return null;
                  return (
                    <div className="place-detail-card animate-fade-in">
                      <div className="place-icon-box">
                        <span className="fs-1-4">📍</span>
                      </div>
                      <div className="flex-1">
                        <strong className="block fs-1-0 mb-line color-slate-800">
                          {mp.name}
                        </strong>
                        <p className="fs-0-8 m-0 lh-1-5 color-slate-500 word-keep-all">
                          {mp.description}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

             {/* 타임라인 장소 카드 */}
             <div className="timeline-wrapper">
               {activeDay.places.map((p, j) => {
                 const dist = j > 0 ? calcDistance(activeDay.places[j-1].lat, activeDay.places[j-1].lng, p.lat, p.lng) : '';
                 return (
                   <div key={j} className="timeline-row">
                     {/* 좌측: 선과 숫자 */}
                     <div className="timeline-left">
                       <div className="timeline-vertical-line" />
                       <div className={`timeline-node-dot ${selectedPlace === p.name ? 'node-active' : 'node-inactive'}`}>
                         {j + 1}
                       </div>
                     </div>

                     {/* 우측: 거리 및 카드 */}
                     <div className="timeline-right">
                       {/* 거리 표시 */}
                       {dist && (
                         <div className="distance-badge-container py-line timeline-distance-gap">
                           <span className="distance-badge fs-0-75">
                             🚶 {dist}
                           </span>
                         </div>
                       )}

                       {/* 장소 카드 */}
                       <div
                         onClick={() => setSelectedPlace(p.name)}
                         className={`itinerary-item-card ${selectedPlace === p.name ? 'active' : ''}`}
                       >
                         <strong className="block fs-0-9 mb-line color-slate-800">
                           {p.name}
                         </strong>
                         <span className="fs-0-75 lh-1-5 color-slate-500 word-keep-all block">{p.description}</span>
                         {selectedPlace === p.name && (
                           <div className="mt-line fw-600 color-primary fs-0-72">
                             📍 지도에서 보기
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>

             {/* 내 일정에 담기 플로팅 버튼 */}
             <div className="save-floating-btn-container">
               <button
                 className="primary save-btn-large"
                 onClick={saveToMyItinerary}
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
