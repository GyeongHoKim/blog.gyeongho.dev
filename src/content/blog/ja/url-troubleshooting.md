---
title: 'Golang v1.9.3の問題によるRTSP認証のトラブルシューティング'
description: 'Golang v1.9.3 net/urlはvalidationがない'
pubDate: 'Dec 6 2024'
heroImage: '../../../assets/images/dog.png'
category: 'Backend'
tags: ['golang', 'net/url']
lang: 'ja'
---

# カメラ映像が表示されません

私は主にWebでIP Camera映像を表示します。フロントエンドも開発し、バックエンドも開発し、インフラも私が担当します。ある日、私のボスが私のウェブページでカメラ映像が表示されないと言いました。

# RTSP Digest Authの問題

ログを確認したところ、Authentication過程で問題がありました。正確には、usernameまたはpasswordに特殊文字が含まれているとエラーが発生するように見えました。

# 原因

問題を見つけるのにかなり苦労しました。結論は、Golangのv1.9.3 net/urlがURLを解析する際、user infoに対してエンコーディングをチェックしないためです。v1.9.4からは問題なくエラーを返します（エラーを返すべきが正常なのに、エラーを返さないことが問題です）。

[stackoverflow](https://stackoverflow.com/questions/48671938/go-url-parsestring-fails-with-certain-user-names-or-passwords)

例えば：

```go
package main

import (
    "fmt"
    "net/url"
)

func main() {
    dsn1 := "postgres://user:abc{DEf1=ghi@example.com:5432/db?sslmode=require" // this works up until 1.9.3 but no longer in 1.9.4
    dsn2 := "postgres://user:abc%7BDEf1=ghi@example.com:5432/db?sslmode=require" // this works everywhere, note { is now %7B

    u, err := url.Parse(dsn1)
    fmt.Println("1st url:\t", u, err)

    u, err = url.Parse(dsn2)
    fmt.Println("2nd url:\t", u, err)
}
```

最初のケースでエラーを返すのが正しい動作ですが、Golang v1.9.4以前のバージョンではそれができません。

# 解決法

Golangがエラーを返さないため、私が特殊文字があるかチェックしてエラーを返すようにしました。

[pull request内容](https://github.com/GyeongHoKim/vdk/commit/5318f2ad7b388ebbbe1207fa1efa8e617f7dfa4a)

```go
pattern := `[ !#$%&'()*+,/:;=?@\[\]]`
re := regexp.MustCompile(pattern)
if re.MatchString(username) || re.MatchString(password) {
	return errors.New("please url encode username and password")
}
```
