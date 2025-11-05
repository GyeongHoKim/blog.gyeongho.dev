---
title: 'Golang v.1.9.3의 문제 인한 RTSP 인증 트러블슈팅'
description: 'Golang v1.9.3 net/url은 validation이 없다'
pubDate: 'Dec 6 2024'
heroImage: '../../../assets/images/dog.png'
category: 'Backend'
tags: ['golang', 'net/url']
---

# 카메라 영상이 나오지 않아요

나는 주로 Web에서 IP Camera 영상을 보여준다. 프론트도 개발하고 백엔드도 개발하고 인프라도 내가 한다. 어느날, 내 보스가 내 웹 페이지에서 카메라 영상이 안나온다고 했다.

# RTSP Digest Auth 문제

로그를 보내 Authentication 과정에서 문제가 있었다. 정확히는, username 혹은 password에 특수문자가 들어가면 에러가 발생하는 것으로 보였다.

# 원인

문제를 찾아내는 것에 꽤 애를 먹었다. 결론은 Golang의 v1.9.3 net/url이 url을 파싱할 때 user info에 대해 인코딩을 검사하지 않기 때문이다. v1.9.4부터는 문제없이 에러를 반환한다(에러를 반환해야 정상인데 에러를 반환안하는게 문제라는 것).

[stackoverflow](https://stackoverflow.com/questions/48671938/go-url-parsestring-fails-with-certain-user-names-or-passwords)

예를 들어,

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

첫번째 경우에서 에러를 반환하는게 옳은 동작이나 Golang v1.9.4 이전 버전에서는 그렇지 못하다.

# 해결법

Golang에서 에러를 반환안하니 내가 특수문자 있는지 검사해서 에러를 반환하게 만들면 된다.

[pull request 내용](https://github.com/GyeongHoKim/vdk/commit/5318f2ad7b388ebbbe1207fa1efa8e617f7dfa4a)

```go
pattern := `[ !#$%&'()*+,/:;=?@\[\]]`
re := regexp.MustCompile(pattern)
if re.MatchString(username) || re.MatchString(password) {
	return errors.New("please url encode username and password")
}
```
