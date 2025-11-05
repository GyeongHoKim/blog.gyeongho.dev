---
title: '브라우저에서 HEVC 영상 스트리밍하기 #3'
description: 'RTP서버와 미디어서버와 브라우저 그리고 나'
pubDate: 'May 07 2025'
heroImage: '../../../assets/images/streaming.jpg'
category: 'Frontend'
tags: ['video']
---

## Overview

자세한 내용은 생략할거지만 웹에서의 영상 재생에 깊게 고민을 해봤다면 아래 내용 보고 대부분 이해할 수 있을것이다.

## 재생의 주체, 그리고 Live와 VOD

재생의 주체가 브라우저가 아니라면 사실 Live와 VOD는 구분이 없다. 둘 다 Live영상으로 처리해주면 된다.  
문제는 재생의 주체가 브라우저일 경우에 발생한다.

## 웹어셈블리

브라우저가 해석할 수 없는 HEVC 영상을 표출해야 하므로 HEVC 디코딩을 직접 구현해야 한다.
내 경우에는 AVC와 HEVC 둘 다 지원하도록 웹 어셈블리를 만들었다.

FFmpeg을 SIMD 지원안해주냐고 하는 이야기는 예전부터 있었고 이걸 하려면 웹 프론트엔드 그리고 비디오 디코딩 두 분야에서 일해본 사람이 FFmpeg 프로젝트를 주도해야 하는데 일단 거기서부터 현실성이 없다. 참 안타깝게도 웹 프론트엔드 개발자들은 대부분 비디오 디코딩에 관심이 없고 FFmpeg 메인테이너들은 웹에 관심이 없다.

FFmpeg 이슈 답변을 보면 필요없기 때문에 안한다는 답변이 있다. 그들은 애초에 웹에 관심이 없다.
중국 개발자가 하도 답답해서 DCT만 SIMD 지원했던건 있으니 그거 써봐도 된다.

https://www.nxrte.com/jishu/53948.html 참고바람.

## 백프레셔

2편에서 설명했듯이 브라우저 측에서 서버의 영상 공급 속도를 제어해줄 필요가 있다. 간단한데, CPU와 메모리 상태를 모니터링하고 있다가 TCP window size를 적절하게 줄여주면 된다. 메모리 상태의 경우에는 performance.memory가 비표준이라서 사용하기 꺼림직할텐데, 그러면 그냥 high water mark를 원하는 바이트 단위로 지정해서 쓰는것도 나쁘지 않다. 내 경우에 CPU는 nominal인 경우에만, 메모리는, high water mark로 적절한 바이트 용량 계산해서(size 콜백으로 바이트 계산하는 방식을 넣지 않으면 chunk 통째로 사이즈가 잡히니 주의 바람) 블로킹 처리를 했다.

미디어 서버를 이벤트 드리븐 아키텍처가 아니거나 RTSP Life Cycle과 WebSocket/WebTransport Life Cycle을 일치시키게 구현을 했다면 이 부분에서 문제가 생길 것이니 주의 바람.

## WebCodecs API

대부분의 브라우저 API들은 인코딩된 영상을 기준으로 한다. Raw Video를 쓰고 싶다면 WebCodecs의 VideoFrame을 활용해야 한다. 디코딩된 영상은 보통 YUV Plane에 정의되는데 이 버퍼를 VideoFrame으로 전환하면 된다. WebCodecs API는 raw video 기준이라서 이걸 써야 한다.

**주의**: RTP 타임스탬프는 미디어마다 단위가 다르기 때문에 SDP 파싱해서 Clock Rate보고 Micro second단위로 변환해주어야 한다. 상대값이기 때문에 첫 프레임보고 시간차로 찍어주면 된다.

## JSON에 unsinged int 64를 넣으면 정보가 손실됨

JSON 파싱이 기본으로 number 변환하는데 이게 double에 해당하기 때문에 unsigned int 64 넣으면 정보 손실된다.
영상에서는 타임스탬프가 꽤 중요하기 때문에 unsigned int 64를 넣는게 아니라 Buffer로 넣어서 DataView로 파싱하던가 아니면 받을때 Stream으로 받아서 BigInt로 파싱하든가 해야 한다.

## 멀티 프로세스

영상 받는 쪽, 그리고 렌더링하는 쪽이 I/O가 빈번하고, 디코딩은 CPU 집약적이다. 따라서 웹워커를 써야 한다.

## 모니터 주사율

프레임 드롭은 나쁜게 아니다! 모든 프레임을 다 재생하게 되면 재생속도가 안맞게 된다. 모니터 주사율에 맞춰서 적절하게 프레임 드롭을 시켜라.

## 렌더링은 GPU로

WebGPU가 이제 표준이다. wgsl 언어를 공부하고 GPU로 렌더링을 하자. 해보면 알겠지만 가장 리소스 많이 먹는 건 디코딩이 아니다. 렌더링이다.

## Video element를 활용하는법

Videl element가 받는 source buffer는 raw video를 지원하지 않는다. 따라서 Track의 writable에 VideoFrame을 직접 써줘야 한다.

해봤는데 결국 Canvas로 돌아가게 되어있다. 애초에 Video element를 쓰는 이유가 HTML5의 Video element가 제공해주는 콜백들과 API를 쓰기 위함인데 우리는 메모리 관리를 직접하고 재생의 주체가 브라우저에 있기 때문에 직접 제어하는 부분이 많아지면 많아질 수록 쓸 수 없는 API가 점점 늘어나게 된다.
