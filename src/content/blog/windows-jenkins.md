---
title: 'Windows에서 Jenkins의 Docker Agent 사용 시 주의'
description: '저는 리눅스 강도에오, 리눅스를 주세요'
pubDate: 'Nov 18 2024'
heroImage: '../../assets/images/linux_robber.jpeg'
category: 'Backend'
tags: ['jenkins', 'ci']
---

# 사내 세미나 이후

사내에서 프론트엔드 테스팅 전략을 주제로 세미나를 열었다. 세미나 이후 질의응답 내용을 발표자료에 정리하며 다음과 같은 상황을 발견했다.

> windows 환경에서 Jenkins를 구성하는 경우, docker가 실행이 안된다

나의 경우에도 Frontend ci를 windows에 돌리고 있던건 같은 상황이었으나 나는 Jenkins 자체를 jenkins/jenkins 이미지 사용하여 사실상 리눅스에서 돌리고 있는 것과 같았다. 그래서 나는 문제가 발생하지 않았다. 혹시 docker가 OS에 영향을 받나? 그럴리가 없을 텐데?

# 문제 원인

docker agent를 실행하면서 발생하는 로그들을 다 까봤다. 문제의 원인은 docker pipeline이 Host와 Container의 volumn을 맵핑할 때, ':'이 문자를 기준으로 파싱을 하는데

> Windows의 경우 `C:\\어쩌구저쩌구:컨테이너볼륨` 여기서 ':'이게 2번 있다

이건 도커 문제는 아니고 jenkins 플러그인인 docker plugin 문제다.

# 해결 방법

docker pipeline을 수정하기에는 공수가 많이 들고,  
이미 jenkins 설정이 복잡해서 지금 Windows Jenkins를 docker 위에 옮기는 건 싫기 때문에  
해당 pipeline만 Linux PC에 agent를 만들고 ssh연결하여 노드를 생성했다.
