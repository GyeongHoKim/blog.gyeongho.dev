---
title: 'RTSP connection 트러블 슈팅'
description: 'gin.Context는 요청마다 생성되지 않는다'
pubDate: 'Dec 5 2024'
heroImage: '../../../assets/images/squirrel.png'
category: 'Backend'
tags: ['golang', 'gin']
---

# 문제 파악

회사 프로젝트 중, 지도 화면 위에서 실시간 영상을 보여주는 게 있는데 플레이어 쪽에서 Camera 드롭다운을 막 변경하다 보면 RTP 서버에 물린 RTSP 연결이 끊어지지 않고 계속 남아있는 문제가 있었다.

구성은 웹서버 & API 서버 & 미디어 서버 & RTP 서버 & 장치 이렇게 있다. 처음에는 프론트 측에서 WebRTC를 안끊어서 미디어 서버가 RTSP 연결을 유지하는 줄 알았는데 로그를 보니 그게 아니었다. WebRTC 연결이 끊어졌는데 RTSP 연결이 여전히 살아있었음.

# 원인

`gin.Context`를 handler 내의 고루틴에서 그대로 쓰고 있던게 문제였다. 예를 들어,

```go
func handler(c *gin.Context) {
    go func() {
        // Accessing c.Param inside a goroutine
        fmt.Println("UUID:", c.Param("uuid"))
    }()
}
```

이런 코드가 문제다.

# gin.Context는 항상 만들어지지 않는다.

아래는 gin의 실제 구현코드이다.

```go
// ServeHTTP conforms to the http.Handler interface.
func (engine *Engine) ServeHTTP(w http.ResponseWriter, req *http.Request) {
    c := engine.pool.Get().(*Context)
    c.writermem.reset(w)
    c.Request = req
    c.reset()

    engine.handleHTTPRequest(c)

    engine.pool.Put(c)
}
```

여기서 `engint.pool.Put(c)` 로 이미 context가 풀에 반환되어있는데 동일한 참조값을 특정 고루틴에서 쓰고 있으면 race condition이 발생한다.

# 해결 방안

해결은 쉽다. 깊게 복사하던가 새로 하나 변수 만들면 된다. 예를 들어,

```go
copiedContext := c.Copy()
go func() {
  do something
}()
```

```go
deviceId := c.Param("guid")
go func() {
  do something
}()
```
