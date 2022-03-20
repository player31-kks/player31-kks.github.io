---
layout: post
categories: [nodejs, ES6이후]
title: Rest 파라미터
---

<br/>

## 기본 문법

`the rest of`를 해석하면 나머지라는 뜻입니다.이를 생각하면서 살펴봐주세요. Rest 파라미터의 형태는 ...(세 개의 점)을 붙이 모습입니다.

```javascript
function foo(param...rest){
    console.log(param) // 출력값 : 1
	console.log(rest) // 출력값 : [2,3]
}

foo(1,2,3)
```

Rest 파라미터는 함수에 전달되고 남은 인수들을 배열로 받습니다. console.log()로 출력해보면 `...`이 붙여진 `rest`변수는 배열 임을 알 수 있습니다. 즉 `foo`에 함수에 입력된 **나머지 변수**들이 `rest` 배열에 추가됩니다.

<br/>

## 주의할 점

- Rest 파라미터는 반드시 마지막 파라미터여야 합니다.

```javascript
fuction foo(...rest, param){
		console.log(rest)// 오류
		console.log(param) // 오류
}
```

<br/>
- Rest 파라미터는 단 하나만 선언할 수 있습니다.
  <br/>

```javascript
function foo(...rest, ...params){
    console.log(rest) // syntax 오류
    console.log(params) // syntax 오류
}
```

## Rest 파라미터가 등장하기 전에는??

`Input`의 개수가 정해지지 않은 함수들의 경우에는 매개변수를 통해 Input을 전달받지 못합니다. (`sum`,`max` 같은 것이 그러합니다.)
![함수](https://upload.wikimedia.org/wikipedia/commons/3/3b/Function_machine2.svg)

Rest 파라미터가 등장하기 전에는 `arguments`객체로 이를 해결했습니다. `arguments`는 함수 호출 시에 전달된 Input들의 정보를 담고 있는 객체입니다. 함수 내부에서 변수처럼 사용할 수 있습니다.

```javascript
function foo() {
  // 여러 input이 올 수 있음
  console.log(arguments);
}

foo(1, 2, 3);
// 출력값
// '0':1
// '1': 2
// '2' : 3
// length: 3
```

그러나 `arguments`객체는 `배열`이 아닌 `유사 배열 객체`이므로 배열 메서드를 이용할 수 없습니다. `Function.prototype.call`이나 `Function.prototype.apply`메서드를 사용해서 `arguments`객체를 배열로 변환해야합니다.

```javascript
function foo() {
  const array = Array.prototype.slice.call(arguments);

  array.forEach((item) => {
    console.log(item);
  });
}

foo(1, 2, 3, 4);
// 1,2,3,4
```

이 과정보다 `rest` 파라미터를 이용하는게 더 간편하죠? 이런 불편함이 rest 파라미터를 탄생시켰습니다. 참고로 `arrow function`에서는 arguments를 사용하지 못합니다. 이때는 반드시 `rest 파라미터`를 이용해야 합니다.

**Recap**

- rest 파라미터는 함수안에서 한번 쓰일 수 있다.
- rest 파라미터는 반드시 마지막 매개변수여야 한다.
- rest 파라미터는 함수안에서 배열로 동작한다.
  <br/> <br/>

 <p class="text-center text-pink-300 text-2xl font-bold">감사합니다.</p>

![](https://media.giphy.com/media/SHXje0JzTxo1PFDlVm/giphy.gif)
