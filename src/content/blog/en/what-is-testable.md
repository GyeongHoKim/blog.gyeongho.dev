---
title: 'Testable Code and Mocking'
description: 'About mistakes made while writing test code and when to mock'
pubDate: 'Jul 23 2023'
heroImage: '../../../assets/images/squirrel.png'
category: 'Backend'
tags: ['mock', 'test']
lang: 'en'
---

# Testable Code and Mocking

## What is the 'Unit' in Unit Tests??

There's an article on Uncle Martin Fowler's blog that I often read:

> So there's some common elements, but there are also differences. One difference is what people consider to be a _unit_. Object-oriented design tends to treat a class as the unit, procedural or functional approaches might consider a single function as a unit. But really it's a situational thing - the team decides what makes sense to be a unit for the purposes of their understanding of the system and its testing. Although I start with the notion of the unit being a class, I often take a bunch of closely related classes and treat them as a single unit. Rarely I might take a subset of methods in a class as a unit. However you define it doesn't really matter.

Backend developers mostly treat Class as Unit because they're mainly interested in OOP.

But there's a part you must not misunderstand:

> Tests must not verify the unit of **code**. They must verify the unit of **behavior**. Usually, for OOP developers, the unit of behavior is Class, so that's why they do it that way. As you work through complex business logic, the unit of behavior can be **a single small function, or it can span multiple classes to solve one behavior**.

I'll explain this again later.

# Does Unit Testing Really Matter?

[https://martinfowler.com/articles/2021-test-shapes.html](https://martinfowler.com/articles/2021-test-shapes.html)

![unit test pyramid](../../../assets/images/test-shapes.png)

I'll explain this again later.

# Types of Test Doubles

I thought using the Mockito library meant everything was a Mock, but that's not it. It was just named Mock, and I didn't do Behavior Verification. I just used it like a Stub.

Part of an article that Uncle Martin Fowler, whom I like, posted on his blog:

> Meszaros uses the term **Test Double** as the generic term for any kind of pretend object used in place of a real object for testing purposes. The name comes from the notion of a Stunt Double in movies. (One of his aims was to avoid using any name that was already widely used.) Meszaros then defined five particular kinds of double:
>
> - **Dummy** objects are passed around but never actually used. Usually they are just used to fill parameter lists.
> - **Fake** objects actually have working implementations, but usually take some shortcut which makes them not suitable for production (an [in memory database](https://martinfowler.com/bliki/InMemoryTestDatabase.html) is a good example).
> - **Stubs** provide canned answers to calls made during the test, usually not responding at all to anything outside what's programmed in for the test.
> - **Spies** are stubs that also record some information based on how they were called. One form of this might be an email service that records how many messages it was sent.
> - **Mocks** are what we are talking about here: objects pre-programmed with expectations which form a specification of the calls they are expected to receive.
>
> Of these kinds of doubles, only mocks insist upon behavior verification. The other doubles can, and usually do, use state verification. Mocks actually do behave like other doubles during the exercise phase, as they need to make the SUT believe it's talking with its real collaborators - but mocks differ in the setup and the verification phases.

# Why is Mocking Bad?

Test code should be written in units of behavior. That's why some people say test code should always use interfaces (doing everything that way is a bit much... meaningless interface proliferation can increase maintenance costs later).
But when you create a Mock object and dependency-related code enters the test code? Or when you define in test code that a method the Mock object has should execute how many times and what output should come from this input?
This itself already reveals implementation rather than behavior in the test code. So why can't implementation be revealed in test code? If refactoring resilience decreases, test code reliability has problems, and even if emails are sent, people ignore them...

So let's understand when to mock and what the disadvantages of mocking are through examples.

# When Should We Mock?

[When should I mock, Stackoverflow](https://stackoverflow.com/questions/38181/when-should-i-mock)

When you see a great answer to "when should I mock":

> Mock objects are useful when you want to test **interactions between a class under test and a particular interface**.

When do we mock? Exactly when we want to test interactions between SUT and a particular interface. But is this always good? Not necessarily.

# Why is Mocking Bad? Let Me Give an Example

The following example is written. Below is code testing a class called MySorter.

```
// the correct way of testing
testSort() {
    testList = [1, 7, 3, 8, 2]
    MySorter.sort(testList)

    assert testList equals [1, 2, 3, 7, 8]
}


// incorrect, testing implementation
testSort() {
    testList = [1, 7, 3, 8, 2]
    MySorter.sort(testList)

    assert that compare(1, 2) was called once
    assert that compare(1, 3) was not called
    assert that compare(2, 3) was called once
    ....
}
```

If MySorter's implementation changes later, the second test code will fail. But what's the cause of that failure? A defect in the test code itself. Then we can't trust the test code. The behavior is the same, but the internal implementation changed. But the test fails?? This is called **test code with low refactoring resilience**.

# By the Way, Don't Trust Test Frameworks

I often wrote test code using Mock~~ methods or classes in test frameworks (widely used frameworks like Mockito or Jest generally have methods named Mock~~). Actually, Mock frameworks don't have very strict constraints on usage, so it's not impossible for developers to use Mocks as Stubs, or for compilation errors to occur.

So what I want to say is, Mock frameworks don't care much even if you use mock objects as stubs. Below is a test for the `sendInvitations()` method, and the collaborating objects are PdfFormatter and MailServer.

```
testInvitations() {
   // train as stub
   pdfFormatter = create mock of PdfFormatter
   let pdfFormatter.getCanvasWidth() returns 100
   let pdfFormatter.getCanvasHeight() returns 300
   let pdfFormatter.addText(x, y, text) returns true
   let pdfFormatter.drawLine(line) does nothing

   // train as mock
   mailServer = create mock of MailServer
   expect mailServer.sendMail() called exactly once

   // do the test
   sendInvitations(pdfFormatter, mailServer)

   assert that all pdfFormatter expectations are met
   assert that all mailServer expectations are met
}
```

When done like this, if SUT's implementation method changes, the test code will fail. To make this succeed, you might have to add countless training code. But is this training code about behavior? No, this would be code that reveals how the implementation is structured.

## Mocks Are Not Stubs

[https://martinfowler.com/articles/mocksArentStubs.html](https://martinfowler.com/articles/mocksArentStubs.html)

Uncle Martin Fowler, whom I love, says this:

> **Key Points:**
>
> 1. **State Verification vs Behavior Verification**: Stubs use state verification, where you check the state of the System Under Test (SUT) and its collaborators after the method is exercised. Mocks use behavior verification, where you check if the SUT made the correct calls on its collaborators.
> 2. **Setup Phase**: In tests using Stubs, the setup phase involves creating instances of the SUT and its collaborators. In tests using Mocks, the setup phase is divided into two parts: data and expectations. Data sets up the objects you're interested in, and expectations indicate which methods should be called on the mocks when the SUT is exercised.
> 3. **Verification Phase**: In Stubs, you use assertions to check the state of the SUT and its collaborators. In Mocks, you verify that the mock objects were called according to their expectations, in addition to using assertions on the SUT.

SUT means the class we're currently testing.

Let's focus on #1. Stubs are important for verifying the "state" that's returned, and Mocks are important for verifying "behavior". That is, if you don't do Behavior Verification and say "I made a Mock~~", that's wrong. You're clearly creating a Stub and misunderstanding. As an example, imagine a collaborating object interface like below.

```java
public interface MailService {
  public void send (Message msg);
}
```

If we implement this as a Stub:

```java
public class MailServiceStub implements MailService {
  private List<Message> messages = new ArrayList<Message>();
  public void send (Message msg) {
    messages.add(msg);
  }
  public int numberSent() {
    return messages.size();
  }
}
```

It becomes like this, and when used in Test code:

```java
class OrderStateTester...

  public void testOrderSendsMailIfUnfilled() {
    Order order = new Order(TALISKER, 51);
    MailServiceStub mailer = new MailServiceStub();
    order.setMailer(mailer);
    order.fill(warehouse);
    assertEquals(1, mailer.numberSent());
  }
```

It becomes like this. But if we implemented a Mock, how would this test code change?

```java
class OrderInteractionTester...

  public void testOrderSendsMailIfUnfilled() {
    Order order = new Order(TALISKER, 51);
    Mock warehouse = mock(Warehouse.class);
    Mock mailer = mock(MailService.class);
    order.setMailer((MailService) mailer.proxy());

    mailer.expects(once()).method("send");
    warehouse.expects(once()).method("hasInventory")
      .withAnyArguments()
      .will(returnValue(false));

    order.fill((Warehouse) warehouse.proxy());
  }
}
```

This paragraph is a bit off-topic as it explains why Stubs and Mocks are different when mistaking Stubs for Mocks. But I wrote it so I don't forget the mistake I made.

## Can't You Write Tests Just Using the Framework Well Without Knowing the Types?

Of course, you can write tests. But if you write test code without knowing when to use Mocks, when to use Fake/Spy/Stubs, or when to just use real objects, you'll definitely write test code based on the test framework's official documentation or examples, and you'll likely try London-style mocking.

Simply put, London style is a method of using Mocks for all behaviors. Here, Mocks are said to do Behavior Verification. **At this point, implementation is revealed in test code. Test code becomes coupled to implementation. Therefore, if you refactor, tests are likely to break. Because implementation. changed.**

# Returning to the Point: How Do We Get Refactoring Resilience?

This is the original text from the link I wrote above:

How to fix that? Easily:

- Try using real classes instead of mocks whenever possible. Use the real `PdfFormatterImpl`. If it's not possible, change the real classes to make it possible. Not being able to use a class in tests usually points to some problems with the class. Fixing the problems is a win-win situation - you fixed the class and you have a simpler test. On the other hand, not fixing it and using mocks is a no-win situation - you didn't fix the real class and you have more complex, less readable tests that hinder further refactorings.
- Try creating a simple test implementation of the interface instead of mocking it in each test, and use this test class in all your tests. Create `TestPdfFormatter` that does nothing. That way you can change it once for all tests and your tests are not cluttered with lengthy setups where you train your stubs.

All in all, mock objects have their use, but when not used carefully, **they often encourage bad practices, testing implementation details, hinder refactoring and produce difficult to read and difficult to maintain tests**.

The first relates to Mock styles I'll explain below. But the second? It means creating a separate class with a simple implementation of the interface, and the reason is that having training code in each test method is bad.

Honestly, regarding the second method, it's a bit unrealistic because I've never seen legacy code that's clearly separated by interfaces (the design needs to be completely changed, but there's no time. Can't we do it after the deadline? After one project is sold, it ends, so I've never seen maintenance being done... I do it alone lol), and if you ask me to create an implementation for testing, this also takes too much time.

# Mock Styles: Detroit Style and London Style

My uncle (Martin Fowler) says this:

> The **classical TDD** style is to use real objects if possible and a double if it's awkward to use the real thing. So a classical TDDer would use a real warehouse and a double for the mail service. The kind of double doesn't really matter that much.
>
> A **mockist TDD** practitioner, however, will always use a mock for any object with interesting behavior. In this case for both the warehouse and the mail service.

Classical style is also called Detroit style, and Mockist style is also called London style.

- Detroit style
  - Advantage: High refactoring resilience
  - Disadvantage: Poor locality
- London style
  - Advantage: Good locality
  - Disadvantage: Low refactoring resilience

London style seems really good, but if refactoring resilience is low, Test Code ultimately increases maintenance costs. Realistically, you can't mock all external dependencies.
Let's mock public parts or parts that don't change much, and use real objects for private parts or parts that change frequently.

For example, if it's an authentication server API, it probably has a long history since the company was founded, so the implementation doesn't change. It's fine to mock with interfaces. Also, there's a part using our own DB, and since I'm confident this won't change until the company goes under, I just mock and use it.

# What's the Purpose of Writing Unit Tests??

I wrote Unit Tests because I wanted to know exactly where problems occurred. But that's realistically difficult, and there are many alternatives.

As mentioned above, London style has low refactoring resilience. If you write test code like this:

- With London style, Entropy increases as Unit Tests increase (debt increases)
  - Every time you refactor, Unit Tests will break and you'll have to fix them. You'll also need to mock again
- With Detroit style, locality is poor.

  - You can catch bug occurrence through test code failure, but you don't know where that bug occurred.
  - Even if SUT has no problem, since you use real objects, bugs might have propagated through dependencies.

- And actually, if you want to know if problems occurred:
  - Spend money. There are many APM monitoring tools...

That's why people say integration tests are more important. Realistically:

Unit Test: Detroit style & More Integration Tests

I think this approach is appropriate. Locality is low, but actually, if you run test code every time you refactor, you can just look at the part you just modified, so it's not that big a problem, right? Of course, locality will be worse than London style.

# If Testing is Difficult Because of Mocking

1. You should consider if the design is wrong. Testable code comes from object-oriented design.
2. You should reconsider if that SUT is a business-critical part.

<iframe width="560" height="315" src="https://www.youtube.com/embed/RoQtNLl-Wko?si=gwjSTy64L0Un6-rU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

# Abandon TDD. Write Many Tests

Sometimes people confuse Test code and TDD, but that's not it - TDD is just a methodology. Test code should be written a lot. But "meaningful" test code.

<iframe width="560" height="315" src="https://www.youtube.com/embed/gs1qM1TF5zA?si=s4hroFQRiSpyqeS4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
