---
title: 'RTSP Connection Troubleshooting'
description: 'gin.Context is not created per request'
pubDate: 'Dec 5 2024'
heroImage: '../../../assets/images/squirrel.png'
category: 'Backend'
tags: ['golang', 'gin']
lang: 'en'
---

# Problem Identification

In a company project, there's a feature that displays real-time video on a map screen. When users frequently change the Camera dropdown on the player side, RTSP connections tied to the RTP server weren't being closed and remained active.

The system consists of: web server & API server & media server & RTP server & devices. Initially, I thought the media server was maintaining the RTSP connection because the frontend wasn't closing WebRTC, but when I checked the logs, that wasn't the case. The WebRTC connection was closed, but the RTSP connection was still alive.

# Root Cause

The problem was using `gin.Context` directly inside a goroutine within a handler. For example:

```go
func handler(c *gin.Context) {
    go func() {
        // Accessing c.Param inside a goroutine
        fmt.Println("UUID:", c.Param("uuid"))
    }()
}
```

This kind of code is problematic.

# gin.Context is Not Created Per Request

Below is the actual implementation code of gin:

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

Here, `engine.pool.Put(c)` returns the context to the pool, but if a goroutine uses the same reference value, a race condition occurs.

# Solution

The solution is simple. Either make a deep copy or create a new variable. For example:

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
