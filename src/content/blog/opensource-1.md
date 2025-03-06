---
title: '고민을 해결해주는 오픈소스 제작'
description: '미련 남은 사람이 누군가를 위해 우물을 파기'
pubDate: 'Mar 6 2025'
heroImage: '../../assets/images/npm.jpg'
category: 'Frontend'
tags: ['opensource']
---

# 좋은 인터페이스, 위대한 표준

카카오 맵을 선언적으로, 또 프레임워크에 비의존적으로 사용하자.

> 번들링과 트랜스파일링 없이, index.html에 `<kakao-map />` 딱 적으면 바로 카카오 맵을 띄워주자.

# 카카오 맵과 react-kakao-maps-sdk 사용 경험

회사 프로젝트에서 CCTV 영상과 GPS 위치를 맵핑해야 할 때, 카카오 맵을 꽤 많이 사용해왔다. React를 쓰는 (대부분의)프로젝트는 [react-kakao-maps-sdk](https://react-kakao-maps-sdk.jaeseokim.dev/)라는 라이브러리를 사용했고 웹 컴포넌트로 만든 제품의 경우에는 [Kakao 지도 Javascript API](https://apis.map.kakao.com/web/guide/)를 jQuery 혹은 DOM API와 함께 사용했었다.

react-kakao-maps-sdk를 사용하면 구현상세를 들여다 보지 않고도 코드를 바로 바로 이해할 수 있었다. 맵 UI가 들어간 프로젝트 빨리 만들어야 할 때 이 라이브러리 때문에 React를 썼다고 해도 과언이 아닐 정도로 편하고 직관적이었다.

사실, 입사 초 패기넘치던 나는 kakao map & leaflet map & google map을 대통합한 'MAP' 컴포넌트 라이브러리를 만들다가 실패한 적이 있었다. SI프로젝트에 React를 주로 사용하는 지금은 google, kakao를 포함한 다양한 map sdk가 React 래핑 버전을, 심지어 공식문서에서도 추천하기 때문에 해당 라이브러리...필요가...없어졌다...

게다가 내가 퇴사하기 전까지 후임을 위해 디자인 시스템 만들어 놓는게 더 급하기 때문에 이젠 정말 못 만든다. 하지만 나는 미련이 남았다. 신입사원이었던 내가 상상했던 대통합 Map 라이브러리는 못하더라도 kakao map만 따로 똑 떼내어서 퇴근 이후에 라이브러리를 하나 만들어볼까?

# 진행 상황

진행사항은 다음과 같다.

## 마일스톤

https://github.com/GyeongHoKim/kakao-map-components/milestone/1

## npm

https://www.npmjs.com/package/kakao-map-components

# 인터페이스

컴포넌트 인터페이스는 react-kakao-maps-sdk를 따라할 것이다. 다만, kakao map에서 주로 사용되는 API를 대신해서 호출하고 관리해주는 util 패키지를 추가할 것이다.

# Turborepo 사용한 모노레포 구조

```
.
├── apps/
│   ├── docs/           # 문서 사이트 (Astro)
│   └── playground/     # 데모/테스트용 웹앱 (Next.js)
├── packages/
│   ├── kakao-map-components/    # 핵심 카카오맵 컴포넌트 패키지
│   ├── kakao-map-utils/         # 카카오맵 유틸리티 패키지
│   ├── eslint-config/           # 공통 ESLint 설정
│   └── tsconfig/                # 공통 TypeScript 설정
├── .github/
│   └── workflows/               # GitHub Actions CI/CD 설정
├── package.json                 # 루트 package.json
├── pnpm-workspace.yaml          # pnpm 워크스페이스 설정
├── turbo.json                   # Turborepo 설정
└── README.md                    # 프로젝트 설명(심볼릭 링크)
```

내가 필요한 것은,

1. 핵심이 되는 kakao-map-components 패키지
2. map에서 주로 사용하는 Kakao API(주소변환, 경로계산 등)를 대신해서 호출해주는 Util 패키지
3. 라이브러리를 설명하는 Document 정적 웹 페이지
4. 내 라이브러리를 바로 사용할 수 있는 Playground WebAPP(SPA)
5. 위 모든 것들의 eslint, tsconfig를 공통화해주는 tsconfig 패키지와 eslint 패키지

이고 이걸 하나의 레포지터리에서 편하게 관리하려면 Lerna, NX, Truborepo 등의 도구를 쓸 수 있다.

회사에서 Lerna, NX, Turborepo 셋 다 써봤는데 Nx는 IDE가 인식해주고 설정 파일, 빌드 스크립트 등등 다른 사람들이 만들어놓은 플러그인 사용하기 편하고(대규모 or 협업 or 구현에만 집중하고 싶을 때), Turborepo는 구성원 모두가 플러그인 제작을 쉽게할 수 있고 parcel, rollup등을 사용해봤다는 전제하라면 좋다(IDE 지원이나 플러그인 부족하지만 빠름).

난 회사에서 이미 rollup, parcel & grunt, js로 빌드 스크립트, Lerna, Nx, CI에서 병렬 빌드하는 플러그인 제작 등등 오만거 다 해봤기 때문에 컴포넌트 개발 외적인 부분도 능숙하다. 그래서 Turborepo를 택했다.

# CI/CD

github actions를 쓰기로 했고, npm에 배포한다.

# Test

명불허전 Cypress, 역시 웹 컴포넌트 테스트에는 Cypress만한게 없다.  
일단 shadowDOM을 알아서 찾게 만들 수가 있기 때문에 구현에 의존하지 않게 테스트 코드 짤 수가 있다, 최근에 e2e말고 component 테스트 지원한다.
