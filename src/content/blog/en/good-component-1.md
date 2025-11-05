---
title: 'Clip Archive and Managing Single Responsibility One by One'
description: 'Filter hooks and query parameters'
pubDate: 'Mar 15 2025'
heroImage: '../../../assets/images/divide.jpg'
category: 'Frontend'
tags: ['architecture', 'component']
lang: 'en'
---

# What Does Single Responsibility Mean?

Previously, I had a single Hook that managed filter state and created query parameters as needed. My component only handled user interactions, and having a single Hook with the single responsibility of 'filtering' was quite elegant.

Recently, a specific filter feature in Clip Archive became more complex.  
Then readability started to decline. Whenever my boss asked to remove filter A or add filter B, development became sluggish. It was elegant then, but not anymore.

Filtering that needed to be sent to the server and filtering that needed to be managed client-side were both in a single hook.

# Managing Responsibility One by One

Then I came across [this article](https://frontend-fundamentals.com/code/examples/use-page-state-coupling.html) while commuting.

First of all, the example here is not the answer. This varies by situation.

However, I thought the advice to not divide responsibilities by the type of logic was correct, at least for now.

In my case, the situation was a bit different - I had a separate query factory that creates queries for specific entities, and I was using it by passing model A to that query factory. So I separated the models appropriately.

While writing this, I realized I should also write about my thoughts on models, components, and hooks. Next time...
