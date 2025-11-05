---
title: 'Streaming HEVC Video in Browser #3'
description: 'RTP server and media server and browser and me'
pubDate: 'May 07 2025'
heroImage: '../../../assets/images/streaming.jpg'
category: 'Frontend'
tags: ['video']
lang: 'en'
---

## Overview

I'll skip detailed content, but if you've thought deeply about video playback on the web, you'll understand most of the content below.

## The Subject of Playback, and Live vs VOD

If the subject of playback isn't the browser, there's actually no distinction between Live and VOD. Both can be treated as live video.  
The problem occurs when the subject of playback is the browser.

## WebAssembly

Since we need to display HEVC video that browsers can't interpret, we must implement HEVC decoding ourselves.
In my case, I made WebAssembly supporting both AVC and HEVC.

There have been talks about FFmpeg not supporting SIMD, and to do this, someone who has worked in both web frontend and video decoding needs to lead the FFmpeg project, but that's unrealistic from the start. Unfortunately, most web frontend developers aren't interested in video decoding, and FFmpeg maintainers aren't interested in web.

If you look at FFmpeg issue responses, there are answers saying they don't do it because it's not needed. They're not interested in web from the start.
A Chinese developer was so frustrated that they added SIMD support only for DCT, so you can try using that.

Refer to https://www.nxrte.com/jishu/53948.html.

## Backpressure

As explained in part 2, we need to control the server's video supply speed from the browser side. It's simple - monitor CPU and memory status, then appropriately reduce TCP window size. For memory status, performance.memory is non-standard, so it might be uncomfortable to use, but it's not bad to just specify a high water mark in the desired byte units. In my case, I did blocking processing only when CPU is nominal, and for memory, I calculated an appropriate byte capacity as a high water mark (note: if you don't put in a way to calculate bytes with a size callback, the entire chunk size is taken, so be careful).

If the media server isn't event-driven architecture or if you implemented it so RTSP Life Cycle and WebSocket/WebTransport Life Cycle match, you'll have problems here, so be careful.

## WebCodecs API

Most browser APIs are based on encoded video. If you want to use raw video, you must utilize WebCodecs' VideoFrame. Decoded video is usually defined in YUV Plane, so convert this buffer to VideoFrame. WebCodecs API is based on raw video, so you must use this.

**Note**: RTP timestamps have different units per media, so you must parse SDP, check Clock Rate, and convert to microsecond units. Since it's a relative value, calculate the time difference from the first frame.

## Information Loss When Putting Unsigned Int 64 in JSON

JSON parsing converts to number by default, and since this corresponds to double, information is lost if you put unsigned int 64.
Since timestamps are quite important in video, instead of putting unsigned int 64, you should either put it as a Buffer and parse with DataView, or receive it as a Stream and parse with BigInt.

## Multi-Process

The side receiving video and the side rendering have frequent I/O, and decoding is CPU-intensive. Therefore, you must use web workers.

## Monitor Refresh Rate

Frame drops aren't bad! If you play all frames, playback speed won't match. Drop frames appropriately to match the monitor refresh rate.

## Rendering with GPU

WebGPU is now a standard. Study wgsl language and render with GPU. If you try it, you'll realize that the most resource-intensive thing isn't decoding. It's rendering.

## How to Utilize Video Element

The source buffer that Video element receives doesn't support raw video. Therefore, you must directly write VideoFrame to Track's writable.

I tried it, but you end up going back to Canvas. The reason for using Video element in the first place is to use callbacks and APIs that HTML5's Video element provides, but since we manage memory directly and the subject of playback is in the browser, the more parts we directly control, the more APIs become unusable.
