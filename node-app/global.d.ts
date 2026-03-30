// CSS 모듈 수입을 위한 타입 정의
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
