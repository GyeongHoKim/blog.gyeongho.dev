---
title: 'モッキング地獄と意味のあるユニットテスト'
description: '何をテストすべきか？何をテストすべきでないか？'
pubDate: 'Apr 1 2025'
heroImage: '../../../assets/images/ben-white.jpg'
category: 'Frontend'
tags: ['test']
lang: 'ja'
---

# ネタバレ

1. コード自体が誤って設計されている - ビジネスレイヤーを分離できなかった。
2. その機能は実はビジネスロジックではない。

# ユニットテストとモッキング

最近、[LFify](https://github.com/GyeongHoKim/lfify)というオープンソースプロジェクトを進めながら、テストコードを一通り書いてみました。

## ビジネスロジック

このプロジェクトのビジネスロジックは、`.lfifyrc.json`というrcファイルを読み込み、ユーザーが設定したglobパターンに従ってincludeまたはexcludeした後、一致するファイルのCRLFをLFに変換するものです。つまり：

1. ユーザーオプションを正しく解析し、rcファイルを適切に読み込む
2. Globパターンを解釈する
3. CRLFをLFに変換する

これがビジネスロジックと言えます。それでも、2番目の項目はglobパターンの処理が面倒なのでmicromatchを使用したため、私の役割は1番と3番です。

## Manual Mocking

テストにJestを使用しましたが、Jestは[Manual Mocking](https://jestjs.io/docs/manual-mocks)という機能を提供します。

> Manual Mockingをしているうちに、結局micromatchライブラリのビジネスロジックを実装している自分自身を発見しました。

深夜1時頃になり、なぜこんなことをしているのかというイライラから、コードを以下のように変更してしまいました。

```js
describe('shouldProcessFile', () => {
	it('should return true when file matches include pattern and does not match exclude pattern', () => {
		/**
		 * This function uses micromatch to check config.include and config.exclude
		 * so this test case is already tested in micromatch's test file
		 * so I'm not going to test this function
		 */
	})
})
```

# 意味のあるテスト

かなり昔、私が大学生のバックエンド開発者だった頃、Auth機能に関するJUnitテストコードを作成している際に、こんな言葉を聞きました。

そのテストコードはあなたが書くべきものではない、それは結局Authサーバーの機能を検証するものだ。何千年も正常に動作してきたAuthサーバーの機能を、なぜあなたがテストするのか。

つまり、私が言いたいのは...それは私のビジネスロジックではなかったようです。

# 結論

明日出勤しなければならないので、ここで文章を終わらせなければなりません。

## 何をテストすべきか、何をテストすべきでないか

時々、このような状況があります。

関数B内で関数Aが呼び出されるが、機能Bのテスト失敗がAと関連しないようにAをモックすると、機能Bのテストが意味をなさなくなる。

私の考えでは、主に2つの原因があります。

1. コード自体が誤って設計されている - ビジネスレイヤーを分離できなかった。
2. 機能Bは実はビジネスロジックではない。

しかし、これは生産性と関連していますが、LFifyはすべて合わせても200行の簡単なプロジェクトなので、レイヤーを分離するのでしょうか？

> 製品が先でコードが後。コードが先で製品が後ではない。
