---
layout: post
categories: [nodejs, ES6이후]
title: Rest 파라미터 심화
---

## 조건문에 맞게 객체의 값 넣기
클라이언트에게 객체로 값을 전달 할 때 조건문에 맞게 값을 넣어줘야 할 때가 존재한다. 이럴 때 보통 아래의 코드를 사용한다. 

```javascript
    const name = 'kks';
    const payload = {};

    if (name) {
        payload.name = name;
    }

    console.log(payload); // { name : "kks" }
```
이렇게 조건이 하나일 때는 코드를 쉽게 쓸 수 있고 가독성이 나쁘지 않다. 
하지만 이런 조건들이 많다면? 코드를 보자.

```javascript
    const name = 'kks';
    const age = 20;
    const city = '';

    const payload = {};

    if (name) {
        payload.name = name;
    }
    if (age) {
        payload.age = age;
    }
    if (city) {
        payload.city = city;
    }

    console.log(payload); // { name : "kks" , age : 20}

```
반복되는 `if문` 들 때문에 라인수가 길어진다. 또한 payload에 필수적으로 포함 해야하는 값에 대해 분기처리를 할 수 없게 될 가능성도 있다. 

그래서 다음과 같이 사용하면 문제를 라인수도 적고 실수를 방지할 수 있다.
payload에 name, age, city를 포함한다고 할 때

```javascript
    const name = 'kks';
    const age = 20;
    const city = '';

    const payload = {
        ...(name && {name}),
        ...(age && {age}),
        ...(city && {city})
    };
    console.log(payload); // { name : "kks" , age : 20}
```

### Short-circuiting
설명하기 앞서 Short-circuiting (&& 연산자)에 대해서 설명하면
`&&` 연산자는 (처음 && 마지막) 연산으로 구성되어 있는데 
처음 값이 `falsy`한 값이면 `falsy`한 값을 내지 만 만약 처음값이 `truthy`한 값이면 마지막 값을 반환한다. 예시를 보자

```javascript
console.log(0 && 'Orange');       // 0
console.log('' && 'Orange');      // ''
console.log(true && null);        // null
console.log('Apple' && 'Orange'); // Orange
```

Short-circuiting과 함께 rest parameter를 같이 사용하면 다음과 같이 분석할 수 있다. (age에 한에서 분석해보자)
*  `age && {age}`     ->  `age가 20이므로 {age} 반환`
*  `{...{ age } }`    ->  `{ age:20 }`

그래서 결론적으로 다음과 같이 가독성이 있는 코드를 만들 수 있다.
```javascript
    const name = 'kks';
    const age = 20;
    const city = '';

    const payload = {
        ...(name && {name}),
        ...(age && {age}),
        ...(city && {city})
    };
    console.log(payload); // { name : "kks" , age : 20}
```