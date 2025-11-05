---
title: 'Streaming HEVC Video in Browser #2'
description: 'Dancing with RTSP'
pubDate: 'May 06 2025'
heroImage: '../../../assets/images/streaming.jpg'
category: 'Frontend'
tags: ['video']
lang: 'en'
---

## Overview

We need to parse RTSP packets and extract video, audio, and metadata. And we need to send that to the browser **carefully**.

## RTSP

If you're reading this, it means you've read [this document](https://www.rfc-editor.org/rfc/rfc2326.html). So I'll skip explanations about RTSP and assume you're already proficient in RTSP. Also, you've probably researched and directly created server configurations and how video information flows from where to where for web video streaming on Naver Cloud tech blog, Twitch tech blog, and StackOverflow or Reddit for hours every day after work - I'll skip related content.

Since we don't use WebRTC (we need to directly control RTP packets because the codec of the video we're playing isn't supported by browsers, but browsers don't allow direct RTP control and only provide high-level APIs), we must directly extract video from RTSP packets.

Video extraction won't be a problem for you who are proficient in RTSP. But there are things to consider when sending that to the browser.

## Side Note: AVCC and AnnexB are Container Formats (Open Source Contribution)

The RTSP client open-source library we were using kept intermittently terminating sessions saying IFrames didn't come in for 10 seconds, and it was reproducible in production (that camera was 30 IPS). While looking at issues on that open-source library's Github, I found an issue that seemed to be our situation, and no one was fixing it.

The cause was that the RTP Client was parsing AVCC and AnnexB immediately upon receiving RTP packets. As you know, AVCC and AnnexB are container formats, and RTP Payload just contains NALu(s) according to packetization mode - one or multiple. Of course, there's no Emulation Prevention, so if AVCC verification fails, a Single NALu gets split into multiple data chunks, and the IFrame verification logic checks wrong bits and throws an exception saying IFrames didn't come in.

They didn't even implement all Packetization Modes! It just happened that our RTP server was sending packets in a Packetization Mode that RTSP client could parse.

I fixed both issues and submitted a pull request. I had also submitted a pull request for bug fixes in the same library before, and it took the maintainer about a year to check my PR - I wonder how this one will be.

Web developers might be puzzled, but the web ecosystem is unusually vibrant with open source, and this is how it originally was...

## Protocol Selection

We need to decide which browser-supported protocol to use for transmitting video.

1. HTTP/1 and HTTP/2
2. WebSocket
3. HTTP/3

Backpressure (after decoding on the browser side, video takes up quite a bit of memory because video compression is very efficient) is absolutely necessary. Without backpressure, browser memory explodes. So it narrows down to options 2 and 3, which can dynamically adjust TCP window size.

The key here is that we need a way for the client side to control supply speed. Whether it's the method of reducing TCP window size I described above or another method I didn't think of, you'll end up choosing between 2 and 3 after consideration. I know.

## RTSP and WebSocket/WebTransport Must Be Thought of Separately. You Can't Just Relay.

Situations where TCP window size is reduced come quite frequently. Let's say you made a server that just relays. By the time the browser has spare memory and raises TCP window size again, quite a long time has passed, and RTSP would have already been disconnected (if it's VOD and the video ended), and since your implemented server only relays, WebSocket/WebTransport disconnects when RTSP disconnects. Then from the browser's perspective, by the time memory becomes available, there's nothing left to play.

To prevent such situations, among servers involved in streaming, if the Media server is OnDemand, you must implement it with an Event Driven architecture.

If you've finished making the media server, now it's time for the player.
Continued in the next part
