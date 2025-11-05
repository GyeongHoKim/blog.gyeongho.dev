---
title: 'Digest Authentication and User Experience Improvement'
description: 'Background of adopting JWT tokens'
pubDate: 'Dec 8 2024'
heroImage: '../../../assets/images/rabbit.webp'
category: 'Frontend'
tags: ['authentication', 'jwt']
lang: 'en'
---

# Product Background

Our product was not originally designed with web business in mind. Since it's designed for communication with IP Cameras, NVRs, or DVRs, the main communication protocols are ONVIF and RTCP/RTSP, with HTTP being a minority. IP cameras do use HTTP communication, but all products on the market (that I've seen) use Digest authentication. Our VMS is not used through a browser but rather runs CEF on top of a Windows APP. Many APIs still use custom protocols to communicate with proprietary clients without going through the network. Naturally, they use Digest authentication.

# Problem Identification

Our boss said they wanted to reduce dependence on proprietary clients.  
Then this year, a use case finally emerged where our product would be used through a **browser** in web business, and the following situation occurred:

> After a few minutes, a login dialog keeps appearing in the browser.

This is a problem caused by our use of Digest authentication.

# Brief Explanation of Digest Authentication

Digest authentication is also a web standard. Basically, digest authentication uses CHF to generate a digest and prevent plaintext transmission. The communication process is as follows:

1. Client sends a request to the server.
2. Server sends 401 Unauthorized, including realm, nonce, algorithm, and qop in the headers.
3. Client calculates cnonce and digest based on the above values and sends another request including them.
4. Server verifies the digest and sends a response including repauth.

## No Database Usage

In this authentication method, the server calculates a hash value and stores it in a file. Since file access doesn't go through the network, it's relatively faster than using a database.

## Stateless

nonce is important - nonce is a value the server generates for each request to prevent replay attacks. Basically, Digest authentication is stateless and must repeat the above process for each request.

# User Experience

Modern browsers intercept all requests coming through the Network. When they encounter an Authorization header, especially one used for Digest authentication, they **block the UI thread**. Since Digest authentication generates a new Nonce for each request, the following situation occurs:

1. User clicks a certain button, which sends 3 requests to the server.
2. Browser blocks the UI thread and prompts the user for username and password.
3. The first request succeeds, but since the 2nd request was already sent asynchronously, when the 2nd response arrives after component re-rendering:
4. Browser blocks the UI thread and prompts the user for username and password.
5. Request succeeded, but... (same thing)
6. (same thing)

The user experience is terrible. Especially, the initial loading score is low due to the first request when the WebAPP starts. When the UI thread is blocked, users can't see anything on the screen and just log in about 3 times.

# Why We Used JWT Token Instead of Sessions

Of course, we don't use a database by default, but if we ask users to set up a database, users can set up a database and connect it to our product. So database wasn't a problem for either session-based or JWT token authentication methods.  
Then we needed to decide which method to use between the two. Both session and JWT token methods have pros and cons. Sessions have lower performance because they hit the database for every request, and JWT has security concerns because tokens are stored on the client side, etc...

We wanted to make a decision based on those pros and cons, but actually, we used JWT not for those reasons but due to practical constraints. Our product wasn't built with the 'web' platform in mind, so implementing sessions on our proprietary framework seemed difficult.

Anyway, since I'm not a backend developer, I just passed along information about the pros and cons of both methods, and the backend developer made the final decision. The result was to use the JWT token method.

# Why We Used the Authorization Header

We send our Access Token in the Authorization header. Why we do this:

- Consideration for other systems

The Authorization header is an HTTP standard, so we can maintain consistency when other systems (typically the proxy server I'm developing) handle authentication logic.

- Removing browser dependency

Desktop apps or mobile devices don't have storage like cookies that browsers have.

# Why I Argued for Getting a Public Certificate

It wasn't accepted due to practical reasons like cost and business characteristics, but the fundamental reason was concern about man-in-the-middle attacks.

# Why I Argued for Creating Cookies on the Server Side

This was dropped because backend implementation was difficult, but the reasons for my argument were as follows:

Storing in local storage makes it accessible via JavaScript, making it vulnerable to XSS or CSRF attacks.

## Extracting Cookie Files from Devices

The use case of our product itself involves multiple factory workers using a single device. So when someone asked what if a worker with bad intentions brings a USB, directly takes the cookie file, and steals the Refresh Token stored in that cookie file, I said we can't prevent it (and I thought to myself that was impressive). I did think this was a bit off-topic from XSS or CSRF concerns.

## Using a Modified Browser

You might think, "Using a modified browser? Does that happen often?" But our product itself was built on Chromium, and we were using a modified browser that automatically handles authentication in the background. So I suspect they considered this situation. It's similar to the previous situation, but using a modified browser is a bit off-topic...

# Why I Argued for Separating Access Token and Refresh Token

This was something the backend developer couldn't do because they were busy with other work, but the reasons I argued for separation were:

- Even if the JWT creator came, we can't prevent token theft.

Token theft can happen - we should think about it that way and take approaches to minimize damage. Our product had a very long token expiration period. If a token is stolen, the attacker has too much time to do something with that token.

But if we make it shorter, we can't solve the original problem (user experience). So we use two tokens. There are many articles about this elsewhere, so I'll skip the details.

There was also a question: "If the Access Token is stolen, wouldn't the Refresh Token be stolen at the same time? Why separate them?" The following two points relate to this:

## We Don't Send Access Token and Refresh Token Together in Every Request

Excluding physical theft, token theft is ultimately theft of requests going through the network (proxy, man-in-the-middle attacks, etc.).  
We can't avoid sending the access token, but if we only send the refresh token when calling the API to reissue the access token, the frequency of theft relatively decreases. At least, the case where both Access Token and Refresh Token are stolen at the moment the Access Token is stolen doesn't occur.

## Refresh Token Rotation

The biggest reason another developer was skeptical about Refresh Token was: "If the Refresh Token is stolen, it's like an infinite vending machine for Access Tokens - how do we handle that?"

When I searched, the most commonly mentioned method was to invalidate the existing Refresh Token every time the API to reissue the Refresh Token is called. Then, a stolen Refresh Token will cause an error in the process of reissuing the Access Token. "What about when the Access Token is first issued?" As I said before, we must think that theft will happen and view it from the perspective of minimizing damage.

# How Much Must We Endure

![Endurance](https://i.namu.wiki/i/1r25tCPAOZR0YtQJhVvnurEZ-k2v-Rj4RrTyC8-L3E_2AA9wjNvmH1RKk6-B8G8ddTzKu4N_0mo4e3bQ5QuBtHjNhrEU6wksdbke-ueqk23i2mojxgliDENsnKrlGL0NjTVormGKsz19lfPxWTXFBQ.webp)

Once we adopt the method of entrusting tokens to the client, we must accept security trade-offs.
