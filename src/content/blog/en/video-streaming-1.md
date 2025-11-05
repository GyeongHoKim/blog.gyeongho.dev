---
title: 'Streaming HEVC Video in Browser #1'
description: 'Problem recognition and exploring solutions'
pubDate: 'May 05 2025'
heroImage: '../../../assets/images/streaming.jpg'
category: 'Frontend'
tags: ['video']
lang: 'en'
---

If you're a developer who uses codecs and browser APIs that browsers support, press the back button - unfortunately, there's nothing helpful for you here.

## Overview

Our company is a recording device manufacturer, and the team I'm on develops Windows desktop applications & Windows services. Since the fields are different, unfortunately, there aren't many people interested in web. Therefore, there was no way to stream video on the web. My task was to implement video streaming on the web.

Conclusion: I created a WebAssembly decoder made with C++ & Emscripten, a media server made with Go, and a Video/Canvas Video Player library using Streaming API and Web Worker. Currently, I'm considering supporting ClearKey DRM.

## Protocols and Codecs Our Company Supports

Our video can be received through the following protocols:

1. Proprietary protocol
2. RTP

Codecs are as follows:

1. HEVC (mainstream)
2. AVC

## Protocols and Codecs Browsers Support

Protocols browsers support are as follows:

1. RTP (only WebRTC as a solution, but many video conferencing solution companies use it, and it's an industry-validated method when traffic is low)
2. HTTP/1 and HTTP/2 (many solutions like HLS, DASH exist, famous VOD & Streaming service companies use them, and ABR is possible. Industry-validated method)
3. WebSocket (mainly used by Chinese security service companies, validated method limited to China)
4. HTTP/3 (MOQT was proposed as a standard led by Facebook, but hasn't been formally accepted yet)

Codecs differ by vendor.

Browsers can only decode allowed codecs, and the list of allowed codecs differs by vendor. Our application uses Chromium, and Chromium cannot decode HEVC video we transmit (licensing issue).

## Solutions

We must provide video in a format browsers can interpret. There are two methods:

1. Transcoding: Convert to a codec browsers can interpret, then deliver via industry-validated protocols
2. Browser-side decoding: Receive via protocols browsers can receive, then don't let the browser interpret it - interpret it myself

## Transcoding

Advantages:

1. Can receive browser support and enable video encryption (DRM).
2. Convenient when collaborating with other companies.

Disadvantages:

1. Consumes a lot of computing resources.
2. Latency occurs.
3. More servers are needed.

## Side Note: Is Video Encryption an Advantage?

You used https, wss, so isn't that encrypted? No. That encrypts packets, but if the video itself isn't encrypted, there are plenty of ways to download and leak it (at least I know how).

If you're a frontend developer handling video, you probably know (and don't want it to be known) that companies whose revenue isn't directly hit by video leaks usually don't use DRM (of course, there are cases where it's technically impossible).

Even companies handling very sensitive videos like adult content companies (surprisingly including the world's #1 revenue company), domestic transportation authorities, and police station web pages streaming videos don't use DRM. I directly reproduced and confirmed that video leaks are possible.

Why is that? I thought about it, and while I don't know about other things, what's certain is that only content providers (people who upload videos) consider video encryption an advantage. When I researched, there was strong evidence proving my inference. The entities demanding DRM are usually movie studios...

> Based on the above cases & my personal experience, unless you're a content provider, video encryption is not considered an advantage.

## Direct Decoding

Advantages:

1. Doesn't consume computing resources.
2. Latency from transcoding disappears.

Disadvantages:

0. **It's non-standard**.
1. Browser APIs are designed to receive encoded video.
2. DRM is impossible.
3. Painful whenever collaborating with other companies
4. VOD implementation is tricky (implement directly without browser support)

## Conclusion

We do browser-side decoding.
We're now going into the RTSP world, hold tight.

Continued in the next part
