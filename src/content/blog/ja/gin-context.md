---
title: 'RTSP接続のトラブルシューティング'
description: 'gin.Contextはリクエストごとに作成されない'
pubDate: 'Dec 5 2024'
heroImage: '../../../assets/images/squirrel.png'
category: 'Backend'
tags: ['golang', 'gin']
lang: 'ja'
---

# 問題の把握

会社プロジェクトの中で、地図画面上でリアルタイム映像を表示する機能があるのですが、プレイヤー側でCameraドロップダウンを頻繁に変更していると、RTPサーバーに接続されたRTSP接続が切断されずに残り続ける問題がありました。

構成は、ウェブサーバー & APIサーバー & メディアサーバー & RTPサーバー & デバイスという構成です。最初は、フロントエンド側でWebRTCを切断していないため、メディアサーバーがRTSP接続を維持していると思っていましたが、ログを確認するとそうではありませんでした。WebRTC接続は切断されていたのに、RTSP接続はまだ生きていました。

# 原因

`gin.Context`をハンドラー内のゴルーチンでそのまま使用していたことが問題でした。例えば：

```go
func handler(c *gin.Context) {
    go func() {
        // Accessing c.Param inside a goroutine
        fmt.Println("UUID:", c.Param("uuid"))
    }()
}
```

このようなコードが問題です。

# gin.Contextは常に作成されるわけではない

以下はginの実際の実装コードです。

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

ここで`engine.pool.Put(c)`により、既にcontextがプールに返却されているのに、同じ参照値を特定のゴルーチンで使用すると、レースコンディションが発生します。

# 解決方法

解決は簡単です。ディープコピーを作成するか、新しい変数を作成すればよいです。例えば：

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
