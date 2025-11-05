---
title: 'RTSP Authentication Troubleshooting Due to Golang v1.9.3 Issue'
description: 'Golang v1.9.3 net/url has no validation'
pubDate: 'Dec 6 2024'
heroImage: '../../../assets/images/dog.png'
category: 'Backend'
tags: ['golang', 'net/url']
lang: 'en'
---

# Camera Video Not Showing

I mainly display IP Camera video on the web. I develop frontend, backend, and infrastructure. One day, my boss said camera video wasn't showing on my web page.

# RTSP Digest Auth Problem

When I checked the logs, there was a problem in the Authentication process. Specifically, it seemed errors occurred when special characters were in the username or password.

# Root Cause

I had quite a hard time finding the problem. The conclusion is that Golang's v1.9.3 net/url doesn't check encoding for user info when parsing URLs. From v1.9.4, it returns errors properly (not returning errors when it should is the problem).

[stackoverflow](https://stackoverflow.com/questions/48671938/go-url-parsestring-fails-with-certain-user-names-or-passwords)

For example:

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

Returning an error in the first case is the correct behavior, but Golang versions before v1.9.4 can't do that.

# Solution

Since Golang doesn't return an error, I check if there are special characters and make it return an error.

[pull request content](https://github.com/GyeongHoKim/vdk/commit/5318f2ad7b388ebbbe1207fa1efa8e617f7dfa4a)

```go
pattern := `[ !#$%&'()*+,/:;=?@\[\]]`
re := regexp.MustCompile(pattern)
if re.MatchString(username) || re.MatchString(password) {
	return errors.New("please url encode username and password")
}
```
