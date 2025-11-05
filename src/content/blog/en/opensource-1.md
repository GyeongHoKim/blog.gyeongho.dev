---
title: 'Creating Open Source That Solves Problems'
description: 'Someone with lingering attachment digging a well for others'
pubDate: 'Mar 6 2025'
heroImage: '../../../assets/images/npm.jpg'
category: 'Frontend'
tags: ['opensource']
lang: 'en'
---

# Good Interfaces, Great Standards

Let's use Kakao Map declaratively and framework-agnostically.

> Without bundling and transpiling, just write `<kakao-map />` in index.html and it should immediately display Kakao Map.

# Experience with Kakao Map and react-kakao-maps-sdk

When I needed to map CCTV footage and GPS locations in company projects, I used Kakao Map quite a bit. For projects using React (most of them), I used a library called [react-kakao-maps-sdk](https://react-kakao-maps-sdk.jaeseokim.dev/), and for products built with web components, I used the [Kakao Map Javascript API](https://apis.map.kakao.com/web/guide/) with jQuery or DOM API.

Using react-kakao-maps-sdk, I could understand the code immediately without looking into implementation details. When I needed to quickly build projects with map UI, it wouldn't be an exaggeration to say I chose React because of this library - it was that convenient and intuitive.

Actually, when I first joined the company, I was ambitious and tried to create a unified 'MAP' component library for kakao map & leaflet map & google map, but I failed. Nowadays, since SI projects mainly use React, various map SDKs including Google and Kakao have React wrapper versions, and even the official documentation recommends them, so... that library... is... no longer needed...

Moreover, since I'm more urgently focused on creating a design system for my successor before I leave, I really can't make it now. But I have lingering attachment. Even if I can't make the unified Map library that I, as a new employee, imagined, what if I separate just kakao map and create a library after work?

# Progress

Progress is as follows:

## Milestone

https://github.com/GyeongHoKim/kakao-map-components/milestone/1

## npm

https://www.npmjs.com/package/kakao-map-components

# Interface

The component interface will follow react-kakao-maps-sdk. However, I will add a util package that calls and manages the APIs commonly used in kakao map.

# Monorepo Structure Using Turborepo

```
.
├── apps/
│   ├── docs/           # Documentation site (Astro)
│   └── playground/     # Demo/test web app (Next.js)
├── packages/
│   ├── kakao-map-components/    # Core Kakao Map component package
│   ├── kakao-map-utils/         # Kakao Map utility package
│   ├── eslint-config/           # Shared ESLint config
│   └── tsconfig/                # Shared TypeScript config
├── .github/
│   └── workflows/               # GitHub Actions CI/CD config
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace config
├── turbo.json                   # Turborepo config
└── README.md                    # Project description (symbolic link)
```

What I need is:

1. The core kakao-map-components package
2. A Util package that calls and manages Kakao APIs commonly used in maps (address conversion, route calculation, etc.)
3. A static web page documenting the library
4. A Playground WebAPP (SPA) where you can immediately use my library
5. A tsconfig package and eslint package that standardize eslint and tsconfig for all of the above

To manage all of this comfortably in a single repository, you can use tools like Lerna, NX, Turborepo, etc.

I've used all three - Lerna, NX, and Turborepo - at the company. Nx is convenient because the IDE recognizes it, and it's easy to use plugins others have made for config files, build scripts, etc. (for large scale or collaboration or when you just want to focus on implementation). Turborepo is good if everyone on the team can easily create plugins, assuming you've used parcel, rollup, etc. (lacks IDE support or plugins but is fast).

I've already done everything at the company - rollup, parcel & grunt, build scripts in JS, Lerna, Nx, creating plugins for parallel builds in CI, etc. - so I'm proficient in non-component development aspects too. So I chose Turborepo.

# CI/CD

I decided to use GitHub Actions and deploy to npm.

# Test

As expected, Cypress - there's nothing like Cypress for web component testing.  
You can make it automatically find shadowDOM, so you can write test code that doesn't depend on implementation. It recently supports component testing in addition to e2e.
