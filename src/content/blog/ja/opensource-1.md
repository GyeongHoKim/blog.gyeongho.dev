---
title: '悩みを解決してくれるオープンソース制作'
description: '未練が残る人が誰かのために井戸を掘る'
pubDate: 'Mar 6 2025'
heroImage: '../../../assets/images/npm.jpg'
category: 'Frontend'
tags: ['opensource']
lang: 'ja'
---

# 良いインターフェース、偉大な標準

カカオマップを宣言的に、またフレームワークに非依存的に使用しよう。

> バンドリングとトランスパイリングなしで、index.htmlに`<kakao-map />`と書くだけで、すぐにカカオマップを表示しよう。

# カカオマップとreact-kakao-maps-sdkの使用経験

会社プロジェクトでCCTV映像とGPS位置をマッピングする必要があった際、カカオマップをかなり多く使用してきました。Reactを使用する（大部分の）プロジェクトでは[react-kakao-maps-sdk](https://react-kakao-maps-sdk.jaeseokim.dev/)というライブラリを使用し、ウェブコンポーネントで作った製品の場合は[Kakao地図Javascript API](https://apis.map.kakao.com/web/guide/)をjQueryまたはDOM APIと一緒に使用していました。

react-kakao-maps-sdkを使用すると、実装詳細を深く見なくてもコードをすぐに理解できました。マップUIが含まれるプロジェクトを素早く作成する必要がある際、このライブラリのためにReactを使用したと言っても過言ではないほど、便利で直感的でした。

実際、入社当初は意気盛んでいた私は、kakao map & leaflet map & google mapを大統合した「MAP」コンポーネントライブラリを作成しようとして失敗したことがありました。SIプロジェクトでReactを主に使用する現在は、google、kakaoを含む様々なmap sdkがReactラッピングバージョンを提供し、さらに公式ドキュメントでも推奨しているため、そのライブラリ...必要性が...なくなってしまいました...

さらに、私が退社するまで後任のためにデザインシステムを作成しておくことがより急務なため、今は本当に作れません。しかし、私は未練が残っています。新入社員だった私が想像した大統合Mapライブラリはできなくても、kakao mapだけを切り離して、退勤後にライブラリを1つ作ってみようか？

# 進捗状況

進捗状況は以下の通りです。

## マイルストーン

https://github.com/GyeongHoKim/kakao-map-components/milestone/1

## npm

https://www.npmjs.com/package/kakao-map-components

# インターフェース

コンポーネントインターフェースはreact-kakao-maps-sdkに従います。ただし、kakao mapで主に使用されるAPIを代わりに呼び出し、管理してくれるutilパッケージを追加します。

# Turborepoを使用したモノレポ構造

```
.
├── apps/
│   ├── docs/           # ドキュメントサイト (Astro)
│   └── playground/     # デモ/テスト用ウェブアプリ (Next.js)
├── packages/
│   ├── kakao-map-components/    # コアカカオマップコンポーネントパッケージ
│   ├── kakao-map-utils/         # カカオマップユーティリティパッケージ
│   ├── eslint-config/           # 共通ESLint設定
│   └── tsconfig/                # 共通TypeScript設定
├── .github/
│   └── workflows/               # GitHub Actions CI/CD設定
├── package.json                 # ルートpackage.json
├── pnpm-workspace.yaml          # pnpmワークスペース設定
├── turbo.json                   # Turborepo設定
└── README.md                    # プロジェクト説明（シンボリックリンク）
```

私が必要なのは：

1. コアとなるkakao-map-componentsパッケージ
2. mapで主に使用するKakao API（住所変換、ルート計算など）を代わりに呼び出すUtilパッケージ
3. ライブラリを説明するDocument静的ウェブページ
4. 私のライブラリをすぐに使用できるPlayground WebAPP（SPA）
5. 上記すべてのeslint、tsconfigを共通化するtsconfigパッケージとeslintパッケージ

であり、これを1つのリポジトリで便利に管理するには、Lerna、NX、Turborepoなどのツールを使用できます。

会社でLerna、NX、Turborepoの3つすべてを使用しましたが、NxはIDEが認識してくれ、設定ファイル、ビルドスクリプトなど、他の人が作成したプラグインを使用しやすく（大規模または協業または実装にのみ集中したい場合）、Turborepoは構成員全員がプラグイン制作を簡単に行え、parcel、rollupなどを使用したことがあるという前提であれば良いです（IDEサポートやプラグインが不足していますが高速です）。

私は会社で既にrollup、parcel & grunt、JavaScriptでのビルドスクリプト、Lerna、Nx、CIでの並列ビルドを行うプラグイン制作など、あらゆることを経験しているため、コンポーネント開発以外の部分も熟練しています。そのため、Turborepoを選択しました。

# CI/CD

GitHub Actionsを使用することにし、npmにデプロイします。

# テスト

さすがのCypress、やはりウェブコンポーネントテストにはCypressに勝るものはありません。  
shadowDOMを自動的に見つけるようにできるため、実装に依存しないテストコードを書くことができます。最近、e2eだけでなくcomponentテストもサポートしています。
