---
title: 'Mocking Hell and Meaningful Unit Tests'
description: 'What should we test? What should we not test?'
pubDate: 'Apr 1 2025'
heroImage: '../../../assets/images/ben-white.jpg'
category: 'Frontend'
tags: ['test']
lang: 'en'
---

# Spoiler

1. The code itself was poorly designed - we couldn't separate the business layer.
2. That functionality turned out not to be business logic.

# Unit Tests and Mocking

Recently, I wrote test code while working on an open-source project called [LFify](https://github.com/GyeongHoKim/lfify).

## Business Logic

The business logic of this project is to read an rc file called `.lfifyrc.json`, include or exclude according to the glob pattern set by the user, and convert CRLFs to LF in matching files. So:

1. Correctly parse user options and properly read the rc file
2. Interpret glob patterns
3. Convert CRLF to LF

This can be called business logic. Even then, item 2 uses micromatch because handling glob patterns is tedious, so my role is items 1 and 3.

## Manual Mocking

I used Jest for testing, and Jest provides a feature called [Manual Mocking](https://jestjs.io/docs/manual-mocks).

> While doing Manual Mocking, I found myself implementing the business logic of the micromatch library.

Around 1 AM, frustrated with why I was doing this, I changed the code as follows:

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

# Meaningful Tests

A long time ago, when I was a college student backend developer, I heard this while writing JUnit test code for Auth functionality:

That test code is not something you should write, it's ultimately verifying the Auth server's functionality. Why are you testing Auth server functionality that has worked for ages?

So what I want to say is... that probably wasn't my business logic.

# Conclusion

I have to go to work tomorrow, so I must end this here.

## What Should We Test, What Should We Not Test

Sometimes this situation occurs:

Function A is called within function B, but when we mock A so that B's test failure isn't related to A, B's test becomes meaningless.

I think there are two main causes:

1. The code itself was poorly designed - we couldn't separate the business layer.
2. Function B turned out not to be business logic.

But this is related to productivity - LFify is a simple project of only about 200 lines total, so should we separate layers?

> Products come first, then code - not code first, then products.
