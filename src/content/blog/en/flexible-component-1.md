---
title: 'Building Flexible Components #1'
description: 'Domain dependencies, interfaces, and abstraction levels'
pubDate: 'Oct 24 2024'
heroImage: '../../../assets/images/rabbit.webp'
category: 'Frontend'
tags: ['component']
lang: 'en'
---

# Why do changes take so long?

The causes are as follows:

1. **Domain dependencies** coupled to component interfaces
2. **Non-extensible** interfaces
3. Inconsistent **abstraction levels** of child components used within the component

**Interfaces, interfaces, interfaces** - interfaces are important.

# Domain Dependencies Coupled to Component Interfaces

For example, let's say we created a component called XXXItem. Then it can only be used within the XXX domain. But what about XXXItem, OOOItem? These are used all the time. Similar functionality and behavior, yet we always have to create new ones.

## Solution Process

### Open it up to be usable in all contexts.

### Remove domain context and consider style dependencies

It becomes usable in many places with infinite possibilities for change.
But what if the functionality is "displaying OOItem" but the style is slightly different?
Since the functionality is the same, it's natural to reuse this component to increase productivity. But what if?

What if an Icon is added instead of Text? What if its position keeps changing between front and back? Then what?

### Adding Props to handle this was not a good choice.

As more Props are added, complexity increases with each requirement change (infinite). Maintainability goes down.

### So we subdivided components and separated commonly used parts.

It's a good approach, but my implementation wasn't user-friendly.
**We should hand control to the outside so users can decide**, but instead we just ended up creating multiple rigid components.

# Extensible Structure

## Use standard interfaces whenever possible

```ts
interface Props extends LiHTMLAttributes<HTMLLIElement> {
	button?: ReactNode
}
```

Just extending standard interfaces helps tremendously. Especially, it restrains my own thoughts and enforces (user-friendly) standard interfaces. If you don't follow them, it won't compile.

This Props can use li attributes directly. And, you should use `children` directly without Props related to **data structure**.

If thinking about interfaces is difficult, first extend a standard interface. Then think later.

## Naming is important.

It's better to use **common naming** commonly used in open-source design system libraries as-is.

Everyone else uses Switch and an onChange handler, but don't you alone use Toggle & onToggle.

## Consistency in abstraction levels of child components

```tsx
function SomethingComponent({}: SomethingcomponentProps) {
	// some logic

	return (
		<ParentSomething>
			<AAAFeature className='abstraction-level-1' />
			<BBBFeature className='abstraction-level-1' />
			<div className='implementation-details-suddenly-appear-here'>
				<CCCFeature className='abstraction-level-2' />
				<image href='but-this-is-not-abstraction-anymore??' />
				<div className='but-this-is-not-abstraction-anymore??' />
			</div>
		</ParentSomething>
	)
}
```

I understand why this happened. CCCFeature was probably requested later. But is this correct? No.

Two weeks later, or when someone else looks at this code, their eyes get tired. They lose context and have to go back and forth a lot. It's not understandable at once.

In other words, changes take time. When adding DDDFeature, there's confusion about where to put it. If you put it in level 1 and CCCFeature breaks, what then? Eventually, you have to read all of CCCFeature before deciding where to put it. In the worst case, you also have to modify CCCFeature.
