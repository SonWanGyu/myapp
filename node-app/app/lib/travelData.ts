export interface TravelDestination {
  continent: string;
  country: string;
  cities: string[];
}

export const CONTINENTS = ["아시아", "유럽", "북아메리카", "남아메리카", "오세아니아", "아프리카"];

export const TRAVEL_DESTINATIONS: TravelDestination[] = [
  // 아시아
  { continent: "아시아", country: "대한민국", cities: ["서울", "부산", "제주도", "경주", "강릉"] },
  { continent: "아시아", country: "일본", cities: ["도쿄", "오사카", "교토", "후쿠오카", "삿포로", "오키나와"] },
  { continent: "아시아", country: "중국", cities: ["베이징", "상하이", "칭다오", "시안", "청두"] },
  { continent: "아시아", country: "태국", cities: ["방콕", "치앙마이", "푸껫", "파타야"] },
  { continent: "아시아", country: "베트남", cities: ["다낭", "하노이", "호찌민", "나트랑", "호이안"] },
  { continent: "아시아", country: "대만", cities: ["타이베이", "가오슝", "타이중"] },
  { continent: "아시아", country: "필리핀", cities: ["세부", "보라카이", "마닐라", "보홀"] },
  { continent: "아시아", country: "인도네시아", cities: ["발리", "자카르타", "롬복"] },
  { continent: "아시아", country: "싱가포르", cities: ["싱가포르"] },

  // 유럽
  { continent: "유럽", country: "프랑스", cities: ["파리", "마르세유", "리옹", "니스"] },
  { continent: "유럽", country: "이탈리아", cities: ["로마", "밀라노", "베네치아", "피렌체", "나폴리"] },
  { continent: "유럽", country: "영국", cities: ["런던", "에든버러", "맨체스터", "리버풀"] },
  { continent: "유럽", country: "스페인", cities: ["마드리드", "바르셀로나", "세비야", "그라나다"] },
  { continent: "유럽", country: "독일", cities: ["베를린", "뮌헨", "프랑크푸르트", "함부르크"] },
  { continent: "유럽", country: "스위스", cities: ["취리히", "네덜란드", "제네바", "인터라켄", "루체른"] },
  { continent: "유럽", country: "체코", cities: ["프라하", "체스키크룸로프"] },

  // 북아메리카
  { continent: "북아메리카", country: "미국", cities: ["뉴욕", "로스앤젤레스", "샌프란시스코", "라스베이거스", "하와이", "시카고"] },
  { continent: "북아메리카", country: "캐나다", cities: ["토론토", "밴쿠버", "몬트리올", "캘거리", "퀘벡"] },
  { continent: "북아메리카", country: "멕시코", cities: ["멕시코시티", "칸쿤"] },

  // 오세아니아
  { continent: "오세아니아", country: "호주", cities: ["시드니", "멜버른", "브리즈번", "골드코스트", "퍼스"] },
  { continent: "오세아니아", country: "뉴질랜드", cities: ["오클랜드", "웰링턴", "퀸스타운", "크라이스트처치"] },
  
  // 아프리카 & 기타
  { continent: "아프리카", country: "남아프리카공화국", cities: ["케이프타운", "요하네스버그"] },
  { continent: "아프리카", country: "모로코", cities: ["마라케시", "카사블랑카"] },
  { continent: "남아메리카", country: "브라질", cities: ["상파울루", "리우데자네이루"] },
  { continent: "남아메리카", country: "아르헨티나", cities: ["부에노스아이레스"] },
];
