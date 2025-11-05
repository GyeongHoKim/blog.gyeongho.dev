---
title: 'Frontend Test Strategy #1'
description: 'What should we test? What should we not test?'
pubDate: 'Nov 6 2024'
heroImage: '../../../assets/images/pikachu.png'
category: 'Frontend'
tags: ['test', 'component']
lang: 'en'
---

# What Should We Not Test

1. Things related to DOM tree structure
2. Things that are the browser's responsibility

Whether it renders, whether it composes, whether tag names are correct, etc.
Testing these reduces refactoring resilience (tests that depend on internal implementation).

Example of test code that should not be written:

```tsx
it('should match the snapshot', () => {
	const root = document.createElement('div')
	render(
		<MyComponent1>
			<MyComponent2 />
			<MyComponent3 />
		</MyComponent1>,
		root
	)

	expect(root.innerHTML).toMatchSnapshot()
})
```

All functionality is the same, but if a design change request causes `<MyComponent1 />` to use `<span />` instead of `<div />` internally, the test immediately fails. However, no product defect has occurred.

# What Should We Test

Side effects of actions that reflect user intent

For detailed explanations of actions that reflect user intent and side effects, refer to the Model-View-Intent concept or the Side Effect concept in frontend development.

# Why Not Use Module-Level Unit Tests and Opportunity Cost

When composed of the following modules:

1. UI
2. Domain model or logic
3. Store (or Action)
4. Mapper (or Middleware)

When feature A is added, a total of 4 test codes are written, and each test mocks different modules.

Excluding items 2 and 4, which are likely to contain pure JS, items 1 and 3 lose their meaning as tests if mocked. Also, if feature A is simply a function that displays server data, only item 4 remains as a meaningful test.

Product reliability doesn't increase, and we're testing for the sake of testing. Therefore, we test at the component level combining all modules, and perform visual regression tests for the visual UI parts.

# Component Testing

If viewed with modules as units, it's an E2E test, and if viewed with components as units, it's a unit test.
Below is a Cypress example. It's a representative E2E testing library but supports Component test mode.

```tsx
describe('Bug where second selection disappears when datetime input clear action', () => {
	it('should not lose second selection when clicking clear button on datetime input', () => {
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

It doesn't test based on visual information. To determine if second selection has disappeared, it doesn't look at the actual second selection screen, but rather judges based on whether `step=1`, which represents second selection, exists.

## Warning: Must Not Depend on DOM Structure

Test code should not depend on implementation, test interfaces, etc. General solutions for refactoring resilience issues apply equally to frontend test code.

In the previous test code example:

```typescript
cy.get('input[name="from"]').clear()
```

You must be careful with code that traverses DOM structure like this. If the functionality is the same but the DOM structure changes due to design changes, i.e., if the implementation changes, the test fails not due to a product defect but due to a test code defect.

Such code is only allowed when the interface or basic behavior of the `<CreateScheduleModal/>` component is certain to receive datetime input, will never change even with future changes, and anyone looking at it (even just seeing the name CreateSchedule) can catch that 'this component receives datetime input'.

### Improvement

**We must follow the exact process by which users recognize functionality**. How do users recognize datetime input? They will recognize it by seeing the text "from".

If we improve the previous test code:

```tsx
// find by text
screen.findByText(t(`${field.name}`, { namespace: 'form' }))
// find by label id
cy.get(`[aria-labelby=${field.name}]`).clear()
// find by aria label
cy.get(`[aria-label=${field.name}]`).clear()
```

If you ask whether finding by text or aria label is also DOM-specific, I have nothing to say. Due to the limitations of testing libraries, most testing libraries widely used in the UI testing field so far cannot solve this problem. Therefore, we have no choice but to set rules that are as flexible as possible to DOM changes (always attach aria-label to components related to data, etc.) and test according to those rules.

Or, use the `data-*` approach:

```typescript
cy.get(`[data-cy=${field.name}]`).clear()
```

The testing library documentation, famous in the React community, treats the `data-*` approach as a last resort and recommends using aria-label or text-based find, etc.

## Warning: Testable Components Must Come First

The point to note is that custom components should maximize meaning in markup and follow standard interfaces like HTMLElement.

Let's assume we developed it like this:

```tsx
/**
 * Custom implementation ignoring HTMLInputElement interface
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

In this case, non-standard interfaces like label and step are exposed in the test code for testing.

```tsx
describe('Bug where second selection disappears when datetime input clear action', () => {
	it('should not lose second selection when clicking clear button on datetime input', () => {
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

When you must follow non-standard interfaces, you should use interfaces that everyone can understand at once. There are interfaces commonly used in open-source design system projects. Even if implementation or design differs, interfaces are usually the same. We should follow that naming.

Continued in part 2...
