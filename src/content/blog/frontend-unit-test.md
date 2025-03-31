---
title: '모킹 지옥과 의미 있는 단위 테스트'
description: '무엇을 테스트 할 것인가? 무엇을 테스트하지 않을 것인가?'
pubDate: 'Apr 1 2025'
heroImage: '../../assets/images/ben-white.jpg'
category: 'Frontend'
tags: ['test']
---

# 스포일러

1. 코드 자체를 잘못 설계함 - 비지니스 레이어를 분리해내지 못했다.
2. 그 기능이 알고보니 비지니스 로직이 아니다.

# 단위 테스트와 모킹

최근 [LFify](https://github.com/GyeongHoKim/lfify)라는 오픈소스 프로젝트를 진행하면서 테스트 코드를 쭉 짜봤다.

## 비지니스 로직

해당 프로젝트의 비지니스 로직은 `.lfifyrc.json`이라는 rc파일을 읽어들여 사용자가 설정한 glob pattern대로 include하거나 exclude한 후 일치하는 파일의 CRLF들을 LF로 변환하는 것이다. 그러니까

1. 사용자 옵션을 올바르게 파싱 후 rc파일을 제대로 읽기
2. Glob pattern 해석하기
3. CRLF를 LF로 변환하기

이게 비지니스 로직이라고 할 수 있다. 그마저도 2번항목은 glob pattern 처리하기 귀찮아서 micromatch 썼기 때문에 내 역할은 1번과 3번이다.

## Manual Mocking

Jest를 테스트에 사용했는데 Jest는 [Manual Mocking](https://jestjs.io/docs/manual-mocks)이라는 기능을 제공한다.

> Manual Mocking하다가 결국 micromatch 라이브러리의 비지니스 로직을 구현하고 있는 나 자신을 발견했다.

새벽 1시 쯤 되어서, 내가 왜 이러고 있냐는 짜증이 들어 코드를 아래와 같이 바꿔버렸다.

```js
describe('shouldProcessFile', () => {
	it('should return true when file matches include pattern and does not match exclude pattern', () => {
		/**
		 * This function uses micromatch to check config.include and config.exclude
		 * so this test case is already tested in micromatch's test file
		 * so I'm not going to test this function
		 */
	})
})
```

# 의미있는 테스트

아주 예~~~전에 내가 대학생 백엔드 개발자였던 시절, Auth 기능에 대한 JUnit 테스트 코드 작성하다가 이런 말을 들었다.

그 테스트 코드는 네가 적어야 하는게 아니다, 그건 결국 Auth 서버의 기능을 검증하는 것이다. 천년만년 잘 작동하던 Auth 서버 기능을 네가 왜 테스트하니

그러니까 내가 하고 싶은 말은... 저게 내 비지니스 로직이 아니었던 것 같다.

# 결론

내일 출근을 해야 하니 나는 이만 글을 마무리해야만 해.

## 무엇을 테스트 할 것인가, 무엇을 테스트 하지 않을 것인가

가끔 이런 상황이 있다.

B 함수 내에서 A 함수가 호출되는데, B 기능 테스트 실패가 A와 연관되지 않으려고 A를 모킹했더니 B 기능 테스트가 의미가 없어졌다.

내 생각에는 크게 2가지 원인이다.

1. 코드 자체를 잘못 설계함 - 비지니스 레이어를 분리해내지 못했다.
2. B 기능이 알고보니 비지니스 로직이 아니다.

근데 이게 생산성과 관련이 있는데, LFify는 다 합쳐봐야 200라인인 간단한 프로젝트인데 레이어를 분리해?

> 제품 나고 코드가 나지 코드 나고 제품 나지 않는다.
