---
title: 'Testable한 코드와 모킹'
description: 'Test code를 작성하면서 벌인 실수와 모킹은 언제 해야 하는가에 대해'
pubDate: 'Jul 23 2023'
heroImage: '../../../assets/images/squirrel.png'
category: 'Backend'
tags: ['mock', 'test']
---

# Testable한 코드와 모킹

## 단위 테스트의 ‘단위’는 무엇인가??

내가 자주 보는 마틴 파울러 아저씨의 블로그에 다음과 같은 글이 있다.

> So there's some common elements, but there are also differences. One difference is what people consider to be a *unit*. Object-oriented design tends to treat a class as the unit, procedural or functional approaches might consider a single function as a unit. But really it's a situational thing - the team decides what makes sense to be a unit for the purposes of their understanding of the system and its testing. Although I start with the notion of the unit being a class, I often take a bunch of closely related classes and treat them as a single unit. Rarely I might take a subset of methods in a class as a unit. However you define it doesn't really matter.

백엔드 개발자는 주로 OOP에 관심이 많기 때문에 대부분 Class를 Unit으로 둔다.

하지만 착각해서는 안되는 부분이 있는데

> 테스트는 **코드**의 단위를 검증해서는 안된다. **동작의 단위**를 검증해야 한다. 보통 동작의 단위가 OOP 개발자의 경우 Class이므로 그렇게 하는 것 뿐이지. 복잡한 비지니스 로직을 풀어나가다 보면 동작의 단위는 **작은 함수 하나가 될 수도 있고 여러 클래스에 걸쳐서 하나의 동작을 해결하는 경우도 있다**.

이후에 다시 한번 설명할 것이다.

# is 단위 테스트 really matter?

[https://martinfowler.com/articles/2021-test-shapes.html](https://martinfowler.com/articles/2021-test-shapes.html)

![단위테스트 피라미드](../../../assets/images/test-shapes.png)

이후에 다시 한번 설명할 것이다.

# 테스트 더블의 종류

나는 이때까지 Mockito 라이브러리만 쓰면 다 Mock인줄 알았는데 그게 아니다. 이름만 Mock이었고 나는 Behavior Verification을 안했다. 그냥 Stub처럼 쓴거지.

내가 좋아하는 마틴 파울러 아저씨가 블로그에 올려준 글 중 일부.

> Meszaros uses the term **Test Double** as the generic term for any kind of pretend object used in place of a real object for testing purposes. The name comes from the notion of a Stunt Double in movies. (One of his aims was to avoid using any name that was already widely used.) Meszaros then defined five particular kinds of double:
>
> - **Dummy** objects are passed around but never actually used. Usually they are just used to fill parameter lists.
> - **Fake** objects actually have working implementations, but usually take some shortcut which makes them not suitable for production (an [in memory database](https://martinfowler.com/bliki/InMemoryTestDatabase.html) is a good example).
> - **Stubs** provide canned answers to calls made during the test, usually not responding at all to anything outside what's programmed in for the test.
> - **Spies** are stubs that also record some information based on how they were called. One form of this might be an email service that records how many messages it was sent.
> - **Mocks** are what we are talking about here: objects pre-programmed with expectations which form a specification of the calls they are expected to receive.
>
> Of these kinds of doubles, only mocks insist upon behavior verification. The other doubles can, and usually do, use state verification. Mocks actually do behave like other doubles during the exercise phase, as they need to make the SUT believe it's talking with its real collaborators - but mocks differ in the setup and the verification phases.

# 모킹이 왜 안좋다는 걸까?

테스트 코드는 동작을 단위로 작성되어야 한다. 그것 때문에 어떤 사람들은 테스트 코드를 무조건 인터페이스로 써야 한다고 하기도 한다(모든걸 그렇게 하는건 좀 아닌 것 같고...의미 없는 인터페이스 남발은 추후 수정비용이 더 높을 수 있음) .
근데 Mock 객체를 딱 만들고 의존성과 관련된 코드가 테스트 코드에 들어간다? 혹은 Mock객체가 가진 메서드가 몇 번 실행되어야 하고 이 인풋에서 이 아웃풋이 나와야 한다를 테스트 코드에서 정의한다?
이것 자체에서 이미 동작이 아니라 구현이 테스트 코드에 드러난 것과 진배없다. 그러니까 구현이 테스트 코드에 드러나면 왜 안되냐고? 리팩터링 내성이 떨어지면 테스트 코드의 신뢰도에 문제가 생기고 이메일이 가도 사람들은 무시하거든...

그럼 모킹을 언제 해야 하고 모킹의 단점은 뭔지 예시를 통해 이해해보자.

# 모킹을 언제 해야 해?

[모킹을 언제 해야 하나요, Stackoverflow](https://stackoverflow.com/questions/38181/when-should-i-mock)

모킹을 언제 해야 하나요에 대한 훌륭한 답변을 보면,

> Mock objects are useful when you want to test **interactions between a class under test and a particular interface**.

모킹은 어떨 때 한다? 바로, SUT와 특정 인터페이스 간의 상호작용을 테스트하고 싶을 때 한다. 근데 이게 항상 좋은가 하면 그건 또 아니다.

# 모킹이 왜 안좋은데? 예시를 들어봐

다음의 예시가 적혀있다. 아래는 MySorter라는 클래스를 테스트 하는 코드.

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

만약 추후에 MySorter의 구현 변경이 이루어지면 두 번째 테스트 코드는 실패할 것이다. 근데 해당 실패의 원인이 뭐다? 테스트 코드 자체의 결함. 이러면 테스트 코드를 신뢰할 수가 없다. 동작은 동일하지만 내부 구현이 바뀌었다. 그런데 테스트가 실패하는 상황?? 이걸 보고 **리팩터링 내성이 낮은 테스트 코드**라고 하는 것이다.

# 참고로, 테스트 프레임워크를 믿지말라

테스트 프레임워크에 Mock~~ 어쩌구저쩌구 메서드 혹은 클래스를 사용해서 테스트 코드를 작성 많이 했었다(Mockito나 Jest 등 널리 쓰이는 프레임워크들이 대체로 Mock어쩌구 이런 이름을 가진 메서드가 있음). 사실 Mock framework는 사용에 엄청 엄격한 제약사항이 있는게 아닌지라 개발자가 Mock을 Stub으로 사용해도 컴파일 시에 오류를 낸다던가 이게 불가능하다.

그래서 내가 뭘 말하고 싶은건가하면, Mock 프레임워크들이 mock object를 stub으로 써도 별 상관을 안쓴다는 거다. 아래는 `sendInvitations()` 메서드에 대한 테스트이고 협력객체는 PdfFormatter, MailServer 두 개이다.

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

이렇게 했을 때, SUT의 구현 방식이 바뀌면 테스트 코드가 실패할 것이다. 이거 성공하게 만들기 위해서 training에 대한 코드를 수없이 붙여야 할 수도 있다. 근데 이런 training 코드가 동작에 대한 코드인가? 아니, 이건 구현이 어떻게 되어있는지를 드러내는 코드에 해당할 것이다.

## Mock은 Stub이 아닌데

[https://martinfowler.com/articles/mocksArentStubs.html](https://martinfowler.com/articles/mocksArentStubs.html)

내가 사랑하는 마틴 파울러 아저씨는 이렇게 말한다.

> **Key Points:**
>
> 1. **State Verification vs Behavior Verification**: Stubs use state verification, where you check the state of the System Under Test (SUT) and its collaborators after the method is exercised. Mocks use behavior verification, where you check if the SUT made the correct calls on its collaborators.
> 2. **Setup Phase**: In tests using Stubs, the setup phase involves creating instances of the SUT and its collaborators. In tests using Mocks, the setup phase is divided into two parts: data and expectations. Data sets up the objects you're interested in, and expectations indicate which methods should be called on the mocks when the SUT is exercised.
> 3. **Verification Phase**: In Stubs, you use assertions to check the state of the SUT and its collaborators. In Mocks, you verify that the mock objects were called according to their expectations, in addition to using assertions on the SUT.

SUT는 우리가 지금 테스트하고 있는 클래스를 의미함.

저기서 1번에 집중하자. Stub은 반환되는 “상태”를 검증하는게 중요한 것이고 Mock은 “행위”를 검증하는게 중요한 것이다. 즉, Behavior Verification을 안해놓고 나는 Mock을 만들었어요~~ 하면 안된다는 것. Stub만들어놓고 착각하는게 분명하다. 예시로 아래와 같은 협력객체 인터페이스를 상상해보자.

```java
public interface MailService {
  public void send (Message msg);
}
```

이걸 Stub으로 구현하면

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

이렇게 되고 이걸 Test코드에 사용하면

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

이렇게 된다. 근데 Mock을 구현했더라면 이 테스트 코드가 어떻게 바뀔까?

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

이건 Stub을 Mock으로 착각하는 경우에 대해 왜 다른지의 설명을 적은거라 논점에서 벗어난 문단이긴 하다. 하지만, 내가 범한 실수를 잊지말자는 의미에서 적음.

## 종류 몰라도 프레임워크만 잘 쓰면 테스트 짤 수 있지 않아?

물론 테스트는 짤 수 있다. 하지만, 언제 Mock을 써야 할지, Fake/Spy/Stub을 써야할지, 혹은 그냥 실제 객체를 사용할지를 모르는 채 테스트 코드를 짠다면 분명히 테스트 프레임워크의 공식문서나 예시를 기준으로 테스트코드를 짜게 될 텐데 그러면 높은 확률로 런던 스타일 모킹을 시도하게 될 것이다.

간단히 말해, 런던 스타일은 모든 동작에 대해서 Mock을 사용하는 방식이다. 여기서, Mock은 Behavior Verification을 한다고 되어있다. **이때, 구현이 테스트 코드에 드러난다. 테스트 코드가 구현에 결합된다. 따라서, 리팩터링을 하면 테스트가 깨질 확률이 높다. 구현이. 바뀌니까.**

# 논점으로 돌아와서: 어떻게 리팩터링 내성을 챙기지?

이건 아까 위에서 적었던 링크의 원문인데

How to fix that? Easily:

- Try using real classes instead of mocks whenever possible. Use the real `PdfFormatterImpl`. If it's not possible, change the real classes to make it possible. Not being able to use a class in tests usually points to some problems with the class. Fixing the problems is a win-win situation - you fixed the class and you have a simpler test. On the other hand, not fixing it and using mocks is a no-win situation - you didn't fix the real class and you have more complex, less readable tests that hinder further refactorings.
- Try creating a simple test implementation of the interface instead of mocking it in each test, and use this test class in all your tests. Create `TestPdfFormatter` that does nothing. That way you can change it once for all tests and your tests are not cluttered with lengthy setups where you train your stubs.

All in all, mock objects have their use, but when not used carefully, **they often encourage bad practices, testing implementation details, hinder refactoring and produce difficult to read and difficult to maintain tests**.

첫 번째는 바로 아래에서 설명할 Mock 스타일과 관련있다. 근데 두 번째는? 인터페이스에 대한 간단한 구현을 가진 클래스를 하나 따로 만들라는 뜻인데 이건 왜 그런거냐면 테스트 메서드 각각에 대해 training code가 들어가는 것이 안좋기 때문에 그런거다.

솔직히 두 번째 방법에 대해서는, 좀 현실적이지가 않은게 인터페이스로 딱딱 구분이 잘 되어있는 레거시 코드를 본 적이 없고(아예 설계를 바꿔야 하는데 시간이 없어서 그게 안됨. 마감이후에 하면 안되냐? 프로젝트 하나 팔리고 나면 끝이라서 유지보수를 하는 걸 본적이 없음... 나 혼자 한다 ㅋㅋ), 테스트 용으로 구현체를 만들라고 하면 이것도 시간이 너무 걸린다.

# Mock 스타일: 디트로이트 스타일과 런던 스타일

나의 아저씨(마틴 파울러)가 이렇게 말한다.

> The **classical TDD** style is to use real objects if possible and a double if it's awkward to use the real thing. So a classical TDDer would use a real warehouse and a double for the mail service. The kind of double doesn't really matter that much.
>
> A **mockist TDD** practitioner, however, will always use a mock for any object with interesting behavior. In this case for both the warehouse and the mail service.

Classical 방식이 다른말로 디트로이트 스타일이고 Mockist 방식이 다른말로 런던 스타일임.

- 디트로이트 스타일
  - 장점: 리팩터링 내성이 높음
  - 단점: Locality 안좋음
- 런던 스타일
  - 장점: Locality 좋음
  - 단점: 리팩터링 내성이 낮음

런던 스타일이 정말 좋을 것 같긴한데 리팩터링 내성이 낮으면 결국 Test Code는 유지보수 비용을 증가시킨다. 현실적으로 모든 외부의존성을 전부 Mock할 수는 없는 노릇.
public한 부분 혹은 잘 변하지 않는 부분은 Mock을 하고, private한 부분 혹은 잘 변하는 부분은 실제 객체를 사용하자.

예를 들어, 인증서버 API라고 치면 이거 이미 회사 창립이래로 유구한 역사를 자랑할텐데 이건 구현이 안바뀐다. 인터페이스가지고 Mock해도 상관 없음. 또, 자체 DB쓰는 부분도 있는데 이것도 회사망할 때까지 바뀌지 않는다는 확신이 있어서 그냥 Mock해서 씀.

# Unit Test를 짜는 목적이 뭔데??

나는 문제가 어디서 발생했는지를 정확히 알고싶기 때문에 Unit Test를 짰었다. 하지만, 그것은 현실적으로 어렵고 대체재는 많다.

위에서 말했듯이 런던 스타일은 리팩터링 내성이 낮다. 이렇게 테스트 코드를 짜면

- 런던 스타일로 하면 Unit Test가 늘어날 수록 Entropy가 증가한다(부채가 증가한다)
  - 리팩터링 할때마다 Unit Test는 깨질 것이고 그때마다 고쳐야 한다. 모킹도 새로 해야됨
- 디트로이트 스타일로 하면 Locality가 좋지 않다.
  - 테스트 코드의 실패로 버그 발생은 잡을 수 있으나 어디서 그 버그가 생겼는지를 모른다.
  - SUT에 문제가 없어도 실제 객체를 사용하니, 의존성을 타고 버그가 전파되어왔을 수도 있잖아.
- 그리고 사실, 문제가 발생했는지를 알고 싶으면
  - 돈을 쓰면 된다. APM monitoring 도구가 많으니까…

이러니까 통합테스트가 더 중요하다는 말이 나오는 것이다. 현실적으로 봤을 때,

Unit Test: 디트로이트 스타일 & Integration Test를 더 많이

이 방식이 적절하다고 생각한다. Locality가 낮다고는 하지만 사실 리팩터링할 때마다 테스트 코드 돌린다면, 직전에 수정한 부분을 다시 살펴보면 될 테니 그렇게 큰 문제는 아니지 않을까? 당연히 런던 스타일보다는 locality가 안좋겠지만.

# 모킹때문에 테스트가 어렵다면

1. 설계를 잘못한 것이 아닌지 고민해보아야 한다. Testable한 코드는 객체지향적인 설계에서 나온다.
2. 해당 SUT가 비지니스적으로 중요한 부분인가를 다시 생각해보아야 한다.

<iframe width="560" height="315" src="https://www.youtube.com/embed/RoQtNLl-Wko?si=gwjSTy64L0Un6-rU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

# TDD를 버려. 테스트는 많이 해

가끔가다가 Test코드랑 TDD를 혼동하는 사람이 있는데 그건 아니고 TDD는 방법론일 뿐이다. Test코드는 많이 작성해야 한다. 단, "의미있는" 테스트 코드를.

<iframe width="560" height="315" src="https://www.youtube.com/embed/gs1qM1TF5zA?si=s4hroFQRiSpyqeS4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
