---
author: KyoYoung
title: 웹팩1) 모듈번들러와 테스크러너란?
layout: post
preview: 모듈번들러나 테스크러너는 왜 필요할까?
comments: true
categories: [nestjs, Getting Started]
keywords: 개발, 모듈번들러, 걸프, 웹팩, webpack, frontend, gulp, 프론트앤드
---

## 모듈은 무엇일까?

보통 프로그램을 작성할 때 하나의 파일에 모든 코드를 써넣지 않는다. 여러 개의 파일로 쪼개진 코드조각들, 즉 수많은 모듈이 부품 역할을 하여 하나의 프로그램을 이룬다. 이를 `modular programming`이라고 한다. (분리된 파일 하나하나를 모듈이라 생각하면 된다. )  어떤 모듈들은 혼자서는 작동하지 못하고 다른 모듈이 필수로 필요한 경우가 있는데 이를 `종속성(dependency)를 가진다` 라고 한다.  모듈 프로그래밍을 실천하면 재사용성,테스트,유지보수가 편하다.

## 번들러를 사용하는 이유

기술을 사용할 때는 그 기술을 쓰는 이유가 명확해야한다. 번들러를 왜 사용하는지 알아보자.

### 예기치 못한 충돌

필자는 두 개의 모듈을 만들었다. 코드는 다음과 같다.

**module1.js**
``` javascript
let a = 2;
console.log(a);
```

**module2.js**
``` javascript
let a = 120;
console.log(a);
```

index.html에 각 `module1.js`,`module2.js` 를 script로 추가했다.

**index.html**
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="./module1.js"></script>
    <script src="./module2.js"></script>

</head>

<body>
    <h1>
        개발자도구 console을 확인해보세요.
    </h1>
</body>

</html>
```

결과는 문법 오류이다.

![오류](/assets/images/post-images/2021-10-2/1.png)

동일한 변수이름(a)를 2번 정의했기 때문에 오류가 생겼다.  모듈을 산발적으로 `script` 로 html에 추가하면 여러 문제들이 생긴다.

html 태그를(script) 이용해서 js파일을 가져오는 방법은 또다른 문제들이 있다. 브라우저는 script태그 순서대로 js파일을 요청한다.  만약 module2.js파일에서 module1.js의 코드를 필요로 한다면 html에서 module1.js파일을 먼저 가져와야한다.  **모듈을 가져올 때는 순서를 지켜야한다는 귀찮은 규칙이 생겼다.**

다른 문제점이 있다. 앞서 script태그 하나 하나는 **파일 요청**을 의미한다고 말했다. 지금은 2개여서 별 상관없겠지만 천개, 만개가 된다면? 태그마다 서버와 정보교환을 한다면 사이트 속도는 정말 느릴 것이다.

### import, export로 해결?

ES2015부터 `import` , `export` 문법이 등장했다. 간단하게 import , export에 대해 알아보겠다.

module1.js

```javascript
let a = 2;
console.log(a);
export { a }
```



module2.js

```javascript
import {a} from "./module1.js"
console.log(a)
```

index.html

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <script type="module" src="./module2.js"></script>
   </script>

</head>

<body>
    <h1>
        개발자도구 console을 확인해보세요.
    </h1>
</body>

</html>
```

script태그에 `type="module"` 만 추가하면 import문을 사용할 수 있다.

`import`, `export` 문법을 이용하면 더 이상 script 태그 순서에 신경쓰지 않아도 된다. 그런데 아직 수많은 모듈 파일요청 문제를 해결하지 못했다.(각 파일 마다 따로 요청한다.)

그리고 호환성 문제가 발생한다. ES2015가 아닌 js파일에는  작동하지 않는다.(NPM 패키지들) 그리고 모든 브라우저가 ES2015를 지원하는 것도 아니다.

어떻게 이 문제를 해결할까? 대략적으로 본다면 모듈 파일 요청 문제(만 개,억 개의 모듈을 다운받는 문제)는 한 파일에 모든 모듈 코드를 우겨 넣어주면 해결 할 수 있고, ES2015문법을 모든 브라우저와 NPM 패키지들에 호환되는 문법으로 바꾸어 주면 된다. 이 문제를 해결해주는 도구들이 모듈 번들러와 테스크 러너이다.

## 테스크러너와 모듈번들러

모듈 번들러보다 먼저 등장한 것은 테스크 러너이다. 테스크러너(task runner)는 말 그대로 task를 실행해주는 도구이다. 유명한 자바스크립트 테스크러너로는 [Grunt](https://gruntjs.com/) 와 [Gulf](https://gulpjs.com/) 가 있다. 테스크 러너는 소스코드 축소화, 유닛테스팅, 린트 등의 플러그인을 제공한다. 개발자는 사용하고 싶은 플러그인을 가져와서 순차적으로 작업해준다. 테스크러너의 과정 중 하나인  번들(하나의 파일로 묶어주는 행위)이 전문적으로 돕는 도구, 모듈 번들러가 등장한다.

모듈 번들러는 수많은 js 모듈을 하나의 js파일로 번들링하는데 사용하는 프론트앤드 개발 도구이다. 모듈 번들러는 번들링 이외에도 중복되는 코드, 사용하지 않는 코드를 제거하고 , scss전처리 , 난독화 등의 기능을 제공한다. 모듈 번들러로는 **웹팩(Webpack)**, **롤업(Rollup)**, 그리고 **파셀(Parcel)** 이 있다. 테스크러너, 모듈 번들러를 포함해서 웹팩이 가장 대중적이다.

여기까지 모듈번들러나, 테스크러너가 필요한 이유를 살펴봤고, 다음 글에서는 모듈번들러 중 하나인 웹팩을 직접 사용하면서 각 기능들을 살펴보도록 하겠다.



> 참고 했던 글 <br>
[왜 모듈번들러를 사용할까?](https://medium.com/@rajatgms/why-do-we-need-a-module-bundler-c5ff221523f5) <br>
[테스크러너를 사용할 때 장점](https://www.dbswebsite.com/blog/the-advantages-of-using-task-runners/) <br>
[자바스크립트 모듈 번들러의 역사](https://wormwlrm.github.io/2020/08/12/History-of-JavaScript-Modules-and-Bundlers.html) <br>
[grunt-vs-gulp-vs-webpack](https://stackshare.io/stackups/grunt-vs-gulp-vs-webpack)