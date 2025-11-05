---
title: 'Product Problem Recognition'
description: 'Why refactoring was necessary'
pubDate: 'Nov 9 2024'
heroImage: '../../../assets/images/yonghyun-lee-unsplash.jpg'
category: 'Frontend'
tags: ['Career', 'Retrospect', 'Improvement']
lang: 'en'
---

# Problem Recognition

Our product is a Windows Application. It was not designed with web in mind. Since there was no frontend developer, the team's youngest member or surplus personnel learned JavaScript in a hurry for a day or two and developed it, so there were many problems overall.

1. Sending hundreds of unnecessary static file requests to the server. But only a few of those files are actually used.
2. Too many static file requests cause traffic spikes even with just one user, and the web server can't respond to some files.
3. No exception handling, so when runtime errors occur, the entire WebApp stops. There are limits to handling case-by-case with if statements, and no one knows that context.
4. All dynamically created Nodes and their child HTMLElements don't get destroyed and keep occupying heap memory.
5. Event listeners don't disappear and just accumulate. So after interacting for a few minutes with search, reset, etc., clicking anything causes hundreds of events to bubble.

# Root Causes

1. In simple terms:
   1. They don't use standards, don't follow JavaScript syntax. They hide methods only they know in specific files using rules only they know and non-functional syntax, then inject them at runtime.
   2. When that person leaves, no one can find those rules and functions.
2. All variables and functions are declared globally.
   1. But they get overwritten a lot.
   2. Functions with common names like `foo(); get(); set(); getset() setget();` are defined millions of times each. Since they're all declared globally, the person who knew which function runs when has already left.
   3. Due to the characteristic of requesting the same file 2-3 times from the server then executing it, some files can't have all variables declared as `const`. Only 'they' know which files are like that.
3. Event Handling
   1. They don't use JavaScript's Event class.
   2. Event handlers and HTMLElements are created but never destroyed.
   3. The custom Event class catches events using ClassName, and since ClassName isn't unique, they created ClassName rules only they know to distinguish events by ClassName, but the only person who knew those rules left.
   4. Methods that handle events are implemented using Monkey Patching via Prototype. Therefore, all files are unreliable, and when I `Ctrl + Left Click` on the method that handles this event, nothing appears. Since it's clearly being monkey-patched somewhere using methods only they know, I always have to thoroughly investigate all files.
4. Inserting script tags into index.html at runtime using specific functions to import CSS and JavaScript code.
   1. The intention to load asynchronously because script tags might slow down response is OK.
   2. But it's scattered across each script file rather than in an initialization process, and there's no standard for it, so some scripts have it and some don't.
   3. So when script tags are attached during feature execution and a variable name conflicts with an already declared variable, unintended behavior occurs instead of the intended behavior, or a runtime error occurs due to const.
   4. There's no exception handling. They handle it case-by-case with if statements.
5. Naming is important, but it's a mess overall. Examples are as follows:
   1. `include_js(), include_css()` - I suspect they made a JS version of `#include <sth.h>`. I saw traces of header file imitation in some files.
   2. `strlen(), strcpy(), strcat()` - They made functions to get length, copy, and concat using byte-level manipulation, but they didn't need to make those.
   3. There were many global functions with the same naming as C's stdio or C++'s string library. And again, they were unnecessary or incorrectly implemented functions that happened to match intended behavior.
   4. Method names like getSet, setGet, getFunc, getFoo - you can't tell what they're intended to do.
6. All global functions call isValid(sth) immediately after being called and branch based on the result with an if statement.
   1. First, they didn't clearly define the criteria for Valid.
   2. It returns True if it's in an Array or Map.
   3. The problem is that even parameters that are Valid but not in an Array had this logic applied to all global functions.
   4. Someone who left created isValid, and people who came after thought it was a JavaScript built-in method and used it without understanding the principle.
7. All methods are created through Monkey Patching - all files are unreliable.
   1. To learn how to use a method of a specific class, you have to search through countless files, and you can't tell if the method I'm looking at is a real method, a method monkey-patched in this file, or a method that gets overwritten at runtime.
8. CSS Management
   1. CSS for buttons isn't in the button file. They were using both jQuery and DOM API simultaneously, but button CSS manipulation is done in files related to Table, and Table CSS manipulation is done in index.js.
   2. Inconsistent methods: They fragmented CSS management by using every method available - CSS-in-JS, CSS files, dynamic Style tag insertion, etc.
9. Inconsistent Code Style
   1. They use ES6 syntax inconsistently. What I mean is they define a Class but add methods via prototype.
   2. It's a minor issue, but they use 2 spaces and 4 spaces inconsistently. They don't know tools like ESLint or Prettier exist, so that's one thing, but they're developing with Visual Studio - doesn't VS have an Auto Format feature?
10. No Library Management
    1. I thought they put everything in a folder called lib, but that's not it. They hide it in a specific folder only they know, like malware. And they left, and the next person learned JS for a day or two and was deployed, so they think it's a JavaScript built-in function and use it - that's the problem.
    2. For example, `moment()` is a function from an external library called moment.js. Obviously, someone from 'them' downloaded moment.js somewhere in the project folder to use moment, then put `include_js('<path>')` somewhere among hundreds of files and left.
    3. In the case of date time picker library and excel.js library, they used methods that only exist in those libraries and thought they were JavaScript built-in features.
11. No Package Manager, Bundling, or Build. They use web frameworks by copying entire folders with `CTRL + C`, `CTRL + V` into each project folder.
    1. Let's at least use task automation tools like Grunt. I don't want a build process. But if you're going to copy entire web frameworks into each folder, you can at least automate that.
    2. If not, you should at least specify a **version** in package.json for each folder, but there's nothing that represents the state of each project.
    3. Since there's no build process automation, each project has a different version of the web framework. In other words, they don't manage web framework versions.
    4. When I asked how they get web frameworks, they said they copy that large folder entirely and use it. Then I asked how they deploy for production, and they said copy-paste and modify index.js. So the actually deployed web page calls all files from that large folder, and page loading takes 10 seconds.

# Refactoring Direction

I set rules and established processes. I've changed to something else now, but when I was first deployed and during the transition period:

1. Increased productivity by using appropriate tools.
   - Created a monorepo structure using Lerna & Nx.
   - Created a build process using Grunt and Parcel.
   - Got a computer from someone who left and set up an NPM registry on it. I deployed the design system library and router library I created there.
2. Enforced code style.
   - Now the build script fails if you don't follow the rules below.
   - Decided to use ES6 syntax. But since we still need to use legacy code immediately:
     - I directly created a tool that parses abstract syntax trees and automatically converts Global Scope js to ESM.
     - That's really heartbreaking - if I had made it open source, people would really use it a lot, but our team has no web developers, and teams doing web naturally use AMD, so no one appreciates it.
     - Then when a predecessor deleted code, they accidentally deleted that too (predecessors don't know how to use Git so they don't use it, so it's really gone), and now I really can't prove my achievement. Just thinking about that keeps me up at night.
   - Set up ESLint and Prettier at the monorepo root, plus plugins I directly created (forced UTF-8 encoding conversion, forced CRLF to LF conversion, etc.).
3. Increased productivity.
   - Created a design system. I'll explain this separately later.
