---
layout: post
categories: [typescript, 타입]
title: mapped Types
---

커스텀 타입을 잘 사용하기 위해서는 타입을 잘 만들고 잘 사용해야 합니다. 오픈소스나 라이브러리를 보면 복잡한 타입들이 한눈에 타입이 들어오지 않았는데요 이번에 타입들을 공부하면서 한눈에 이해 할수 있었습니다. 거두절미하고

우선 가장 많이 사용하고 있는 mapped Types부터 알아보겠습니다.


>  👉 mapped Types은 이미 존재하는 타입을 매핑해서 새로운 타입을 만들어내는 타입입니다.


```typescript
type Person = {
  name: string;
  age: number;
};

type UpdatedPerson = {
  name?: string;
  age?: number;
};

function updatePerson(person: Person, update: UpdatedPerson) {
  return { ...person, ...update };
}
```

`Person`과 `UpdatedPerson`은 동일한 필드 값을 가지고 있습니다. 다른 점이 있다면 `UpdatePerson`은 모두 `Optional` 필드 값이라는거죠. 

문제는 `updatePerson` 함수에서 나타나게 됩니다. `person` 타입에서 만약 `country`라는 속성을 갖게 된다면 당연히 `updatePerson`에서 `update` 파라미터의 싱크를 맞춰 주기 위해서 `UpdatePerson`에도 key를 추가해야 합니다. 

뭔가 반복되는 작업 아닌가요?? 이런한 반복을 줄이기 위해서 타입스크립트는 mapped type을 지원하고 있습니다.

mapped type 만들기 전에 먼저 `keyof`키워드에 대해서 같이 알아봅시다.

## keyof
> 👉 keyof는 객체의 키 값들을 union 타입으로 가져오는 연산자입니다.

```typescript
let keys: keyof Person; // 'name'|'age'
```
보는것 처럼 `keyof`는 `Person`의 키값을 이용해서 새로운 UnionType으로 만들어 내는 연산자입니다. 이것을 기초로 mapped type을 만들어 보겠습니다.
 
## mapped Type 만들어보자

```typescript
type MappedTypeName = { [K in UnionType]: ExistingType };
```
저 위에 있는 타입만 보면 쉽게 알수 없습니다. 이제부터 하나하나씩 알아보겠습니다.
 

### In 연산자
in 연산자는 UnionType에 있는 값들을 순회하면서 하나씩 K의 값에 할당하게 됩니다.
그리고 ExistingType에는 원하는 타입을 넣어주면 됩니다. 여기서 중요한 것은 UnionType을 순회한다는 것입니다. 

### mappedType
**즉 mappedType은 In연산자를 통해 UnionType을 순회하면서 내가 원하는 타입을 명시해주는 커스텀 타입인거죠!!!**

더 자세한 내용은 예시로 알아보겠습니다.
```typescript

type Person = {
  name: string;
  age: number;
};

let keys: keyof Person; // 'name'|'age'
type PersonMustHaveStringType = { [K in keyof Person]:string } // {name:string,age:string}
```
아까 언급했던 `keyof`를 이용해서 해당하는 타입의 키들에 대해서 UnionType을 만들었습니다. 그러면 In 연산자를 통해 UnionType을 순회할수 있는거죠 

즉 `PersonMustHaveStringType`은 `Person`의 키값을 가지는 객체이지만 string타입으로 명시를 해줬기 때문에 위와 같은 결과값이 나옵니다.

위에 예시는 PersonType에 종속적인 type입니다. 좀더 일반화한 타입을 만들고 싶으면 제네릭을 사용해 볼 수 있습니다.
그럼 제네릭을 사용해서 만들어볼까요?

```typescript

// Mapped Type의 기본형 중요!!
type MappedType<T> = {
  [K in keyof T]:T[K]
}

interface Person {
  name: string;
  age: number;
}
const P: MappedType<Person> = {
  name: 'kks',
  age: 16,
}; 
```
💪 interface도 타입으로 만들수 있음 보여주기 위해서 interface를 사용했습니다.
`MappedType`을 보면 <T>는 제네릭으로 해당하는 임의의 타입을 모두 받을 수 있습니다. 따라서 T에 해당하는 key들을 keyof로 만들어 In연산자를 통해
keyof로 만들어진 UnionType을 순회하게됩니다. 그럼 K의 값은 T의 키값이 하나하나 들어가게 되는것이죠 그때의 타입 `T[K]`은 임의의 타입 T에대한 key값의 **타입**이 매칭이 됩니다. 

`MappedType`을 기본형으로 여러가지를 만들수 있습니다. 

### 1. ReadOnlyType
읽기만 가능한 객체를 만들때 사용하는 타입입니다.
```typescript
type ReadOnlyType<T> = {
  readonly [K in keyof T]:T[K]
}
```

### 2. WritableType
writableType은 그냥 일반 객체 타입인데 특징으로 readonly를 삭제한 타입 입니다. 이 타입은 Readonly 필드값들이 존재할 혹은 섞여있을 때 모두 writable한 필드값을 만들기 위해 사용할 수 있습니다.
```typescript
type WritableType<T> = {
  -readonly [K in keyof T]:T[K]
}
```

### 3. OptionalType
모든 필드값을 Optional하게 만들때 필요한 타입 입니다.
```typescript
type OptionalType<T> = {
  [K in keyof T]?:T[K]
}
```

### 4. RequiredType
모든 필드값이 Optional을 허용하지 않을 때 사용할수 있는 타입입니다.
```typescript
type Required<T> = {
  [K in keyof T]-?:T[K]
}
```
Readonly <> WritableType 은 기본형에 `readonly`,`-readonly`
OptionalType <> RequiredType은 기본현에 `?` , `-?` 특징을 가지는 것을 알 수 있습니다.



**참조**
* [https://learntypescript.dev/08/intro](https://learntypescript.dev/08/intro)
* [타입스크립트 공식문서](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)


