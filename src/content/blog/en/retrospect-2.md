---
title: 'What I Contributed to the Company'
description: '2024 Retrospective'
pubDate: 'Jan 2 2025'
heroImage: '../../../assets/images/fox.png'
category: 'Frontend'
tags: ['Career', 'Retrospect', 'Improvement']
lang: 'en'
---

# Web Developer: Someone who creates business value or solves problems through web development

When I joined, there was no web developer in our department. [After experiencing various problems](https://blog.gyeongho.dev/post/retrospect-1/), I decided to become a web developer.

> What have I contributed, and what should I contribute?

- Why the company hired me

Our product is a Windows Application. Nevertheless, the reason for introducing web was productivity and design consistency. So I'm sitting here to solve low productivity and inconsistent design. Let me summarize what I contributed in 2024 in these two areas.

# Productivity Improvement

1. Development and Debugging Environment Improvement

- Problem

For the development environment, predecessors had to build the C++ backend server to check if the WEB they were developing worked. If there's a C++ build error, web frontend development stops. They didn't know how to use tools like PostMan, so they developed by imagining things until C++ developers created the API.

- Solution

During development, I used Vite dev server and MSW, mocked with vitest for unit tests, and solved [E2E testing](https://blog.gyeongho.dev/post/frontend-test-1/) with Cypress. I unified debugging with config files for vscode and JetBrains products.

Nowadays, the situation where frontend development stops because the backend server doesn't build no longer occurs.

2. Task Automation Tool Usage

- Problem

Predecessors had to copy+paste folders to use libraries, and for deployment, they manually included all source code in index.html and index.js.

- Solution

I created a monorepo structure using Lerna and referenced the design system and Web Component router library I developed through workspace.
I created build scripts. Initially, I automated it using Grunt with scripts using Parcel and plugins I created directly, and after migrating to TypeScript, the app now uses vite and libraries use tsup.

3. Library Usage Improvement

- Problem

There's no module system (AMD, CJS, ESM), and predecessors download minified js files directly to use open-source libraries, store them somewhere, make them insert dynamically at runtime, then leave, so new predecessors mistake them for JavaScript built-in methods and use them. At the time, the web service had traffic spikes even with just 1 user, and the web server wouldn't even respond, so if the server crashes when responding to that file that inserts external libraries, it doesn't work.

- Solution

At the time, they chose bizarre methods like requesting the same file multiple times or optimizing web server performance. My solution was simple. Just don't request hundreds of unnecessary files from the server. Let's do tree shaking.

4. Code Style Enforcement

- Problem

I heard jokingly that whether to use 2 spaces or 4 spaces was determined by the predecessor's mood at the time. For C++, there was even documentation saying to use Google style, but there was nothing for JS.

- Solution

I used ESLint and Husky to block commits if rules aren't followed.

I remember when I was developing the backend media server, the frontend developer at the time looked at me strangely when they saw that commits don't work if ESLint rules aren't followed.

My successor will probably dislike me for the same reason, but I hope they think about whether they really followed the rules.

5. Documentation

- Problem

There's no documentation. You couldn't know what parameters go in, and predecessors also didn't know what parameters go into globally functions created in ancient times or what gets overwritten at runtime, so they copy+pasted their predecessor's code. When I analyzed it later, there were cases where a vicious cycle occurred due to code incorrectly written by a 2nd-generation predecessor.

- Solution

I wrote JSDoc at least for functions and classes I created. Now that it's migrated to TypeScript, errors occur at build time rather than runtime.

Nowadays, all libraries and design systems I developed don't draw red lines on every line even when IDE's syntax feature is enabled, so my successor developer can now confidently use all IDE features, and if a red line appears during development, they can realize they wrote the code wrong.

# Establishing Consistent Design

1. Design System Development

- Problem

Predecessors chose Inheritance instead of Composition even when there was similar UI. They didn't reuse at the component level like React, Vue, or Angular, and used the same functionality in different ways repeatedly.

- Solution

I couldn't abandon existing legacy, and I couldn't know what framework other developers would choose, so I used Web Components for component-level reuse. Currently, the design system is Web Components, and each App that uses it is developed with React.

2. CSS Management Improvement

- Problem

Predecessors used jQuery to inject CSS into files they wanted at runtime. Since it was practically impossible to find which file to modify to fix specific UI, they mainly chose to forcibly override using `!important`.

- Solution

Since we had to preserve existing CSS, I chose ShadowDOM. I'll mention later, but I'm currently abandoning ShadowDOM for productivity. Unfortunately, Class-based Variants and ShadowDOM are incompatible or require sacrificing bundle size.

3. Storybook Usage

- Problem

Generally, html should handle markup, js should handle logic, and css should handle styles, but unfortunately, since the predecessor at the time wasn't a web developer, they combined markup+logic+styles using jQuery or DOM API in index.js, making it impossible to show just the UI.

- Solution

I got a computer from someone who left, set up a Storybook server, and displayed Stories from the design system I developed. Each component in the design system has no logic and only handles UI.

4. Visual Regression Testing Introduction

Refer to [previous post](https://blog.gyeongho.dev/post/frontend-test-2/).

# Summary

1. Monorepo and build process setup
2. Design system development
3. Router library development usable on proprietary backend servers
4. HTTP client library development usable in proprietary web clients
5. RTSP -> WebRTC, HLS media server development
6. Web APP development using the above design system, router, etc.
