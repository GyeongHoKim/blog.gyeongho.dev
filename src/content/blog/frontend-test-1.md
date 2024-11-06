---
title: 'Frontend Test 전략 #1'
description: '무엇을 테스트 할 것인가??'
pubDate: 'Nov 6 2024'
heroImage: '../../assets/images/pikachu.png'
category: 'Frontend'
tags: ['test', 'component']
---

# 무엇을 테스트하지 않을 것인가

1. DOM 트리 구조와 관련된 것들
2. 브라우저의 책임인 것들

렌더링이 되는가, 합성이 되는가, 태그 이름이 정확한가 등등
해당 사항을 테스트 할 경우 리팩터링 내성이 떨어진다(내부 구현에 의존하는 테스트).

작성하지 말아야 할 테스트코드 예시)

```tsx
it('should match the snapshot', () => {
	const root = document.createElement('div')
	render(
		<내가만든컴포넌트1>
			<내가만든컴포넌트2 />
			<내가만든컴포넌트3 />
		</내가만든컴포넌트1>,
		root
	)

	expect(root.innerHTML).toMatchSnapshot()
})
```

기능 다 똑같은데 디자인 변경 요청으로 인해 `<내가만든컴포넌트1 />`의 내부에서 `<div />`안쓰고 `<span />`을 사용하면 바로 test fail. 그러나 제품의 결함은 발생하지 않은 상태.

# 무엇을 테스트 할 것인가

사용자 의도가 반영된 행동에 대한 부수효과

사용자 의도가 반영된 행동, 부수효과에 대한 자세한 설명은 Model-View-Intent 개념 혹은 프론트엔드 개발에서의 Side Effect 개념을 참고할 것.

# 모듈별 단위테스트 사용하지 않는 이유와 기회비용

다음 모듈로 구성되어있을 때

1. UI
2. Domain model or logic
3. Store(혹은 Action)
4. Mapper(혹은 Middleware)

A 기능이 추가되었을때 총 4개의 테스트 코드를 작성하게 되고 각 테스트에서는 다른 모듈을 모킹하게 된다.

순수 js가 포함될 확률이 높은 2번과 4번을 제외하고, 1번 3번은 모킹을 해버리면 테스트로서의 의미가 그닥 없어진다. 또, A 기능이 단순히 서버 데이터를 표출하는 것에 그치는 기능이라면 의미있는 테스트는
4번밖에 남지 않는다.

제품의 신뢰성은 높아지지 않고 테스트를 위한 테스트를 한다. 따라서 모듈 다 합친 컴포넌트 단위로 테스트하고, 시각적인 UI 부분에 대해 시각적 회귀 테스트를 수행한다.

# 컴포넌트 테스트와 시각적 회귀 테스트

## 컴포넌트 테스트

모듈을 단위로 본다면 E2E 테스트이며 컴포넌트를 단위로 볼 때 단위 테스트이다.
아래는 cypress 예시이다. E2E 테스트 라이브러리로 대표적이지만 Component 테스트 모드를 지원한다.

```tsx
describe('datetime input의 clear 동작 시 second 선택이 사라지는 오류', () => {
	it('datetime input의 clear 버튼을 클릭하면 second 선택이 사라지지 않아야 함', () => {
		// arrange
		cy.mount(<CreateScheduleModal isOpen={true} onClose={() => {}} />, {
			routerProps: {
				initialEntries: ['/cliparchive']
			}
		})

		// act
		cy.get('input[name="from"]').clear()
		cy.get('input[name="to"]').clear()

		// assert
		cy.get('input[name="from"]').should('have.attr', 'step', '1')
		cy.get('input[name="to"]').should('have.attr', 'step', '1')
	})
})
```

시각적인 정보를 기반으로 테스트하지 않는다. second 선택이 사라졌음을 판단하기 위해 실제 second 선택 화면을 보는 것이 아니라 second 선택을 의미하는 `step=1`의 여부를 두고 판단한다.

## 주의: 테스터블한 컴포넌트가 선행되어야 함

주의할 점은 커스텀 컴포넌트에서 최대한 마크업에 의미를 담고, HTMLElement 등 표준 인터페이스를 따라야 한다는 점이다.

아래와 같이 개발했다고 가정하자.

```tsx
/**
 * HTMLInputElement 인터페이스를 무시하는 자체 구현
 **/
@customElement('custom-input')
class CustomInputWC extends LitElement {
    @property({type: String, reflect: true})
    label?: string;
    @property({type: Number, reflect: true})
    unit?: number;

    protected render(): unknown {
        return <input name=${this.label} step={this.unit.toString()}/>
    }
}

const CustomInput: ReactWebComponent<CustomInputWC> = createComponent({
    react: React,
    tagName: 'custome-input',
    class: CustomInputWC
});

const SchedulePage: React.FC<SchedulePage> = ({}) => {
    return <CreateScheduleModal>
        <CreateScheduleModal.HorizontalField>
            <CustomInput label="from" unit={1}/>
        </CreateScheduleModal.HorizontalField>
    </CreateScheduleModal>;
};
```

이 경우, 테스트를 위해 label과 step 이라는 비표준 인터페이스가 테스트 코드에 드러나게 된다.

```tsx
describe('datetime input의 clear 동작 시 second 선택이 사라지는 오류', () => {
	it('datetime input의 clear 버튼을 클릭하면 second 선택이 사라지지 않아야 함', () => {
		// arrange
		cy.mount(<SchedulePage />, {
			routerProps: {
				initialEntries: ['/cliparchive']
			}
		})

		// act
		cy.get('[label="from"]').clear()
		cy.get('[label="to"]').clear()

		// assert
		cy.get('[label="from"]').should('have.attr', 'unit', 1)
		cy.get('[label="to"]').should('have.attr', 'unit', 1)
	})
})
```

비표준 인터페이스를 어쩔 수 없이 따라야 하는 경우에는 모두가 단번에 이해할 수 있는 인터페이스를 사용해야 한다. 오픈소스 디자인 시스템 프로젝트들에서 일반적으로 사용하는 인터페이스가 있다. 구현이나 디자인은 달라도
보통 인터페이스는 같다. 그 네이밍을 따라야 한다.

# 시각적 회귀 테스트

`inex-badge` 컴포넌트 시각회귀 테스트 코드 중 일부 예시)

```typescript
context('with label', () => {
	it('should match snapshot with 한자리수 number', () => {
		cy.mount(html` <inex-badge .label=${1}></inex-badge> `)
		cy.matchImageSnapshot()
	})

	it('should match snapshot with 두자리수 number', () => {
		cy.mount(html` <inex-badge .label=${10}></inex-badge> `)
		cy.matchImageSnapshot()
	})

	it('should match snapshot with 세자리수 number', () => {
		cy.mount(html` <inex-badge .label=${100}></inex-badge> `)
		cy.matchImageSnapshot()
	})
})
```

시멘틱 스냅샷 테스트와 비슷해보이지만 jest의 snapshot 테스팅 라이브러리 등이 아니라 시각회귀 테스트 라이브러리 사용했음에 주의.

2편에서 계속...
