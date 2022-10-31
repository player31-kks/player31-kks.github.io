---
layout: post
categories: [nodejs, 고급레시피]
title: 비동기적으로 초기화되는 컴포넌트
---
## 비동기적으로 초기화되는 컴포넌트 문제

<aside>
💡여기서 초기화란 단어는 무엇일까요? 저는 "초기화"라는 뜻을 비동기 작업이 시작 가능한 상태로 정의하고 이 글을 작성하겠습니다. 예를들어 database가 연결돼서 쿼리가 가능한 상태가 되면 초기화가 완료되었다는 의미고 반대로 데이터베이스가 아직 연결되지 않았다면 초기화중이라는 뜻이죠
</aside>

다음과 같이 DB를 연결하는 코드가 있다고 생각해봅시다. 여기서 0.5초 후에는 무조건 DB가 연결된다고 가정하겠습니다.

```typescript
import { EventEmitter } from 'events'

class DB extends EventEmitter {
  connected = false

  connect () {
    setTimeout(() => {
      this.connected = true
      this.emit('connected')
    }, 500)
  }

  async query (queryString) {
    if (!this.connected) {
      throw new Error('Not connected yet')
    }
    console.log(`Query executed: ${queryString}`)
  }
}

export const db = new DB()
```
이 코드의 문제점이 뭘까요??
1. DB가 연결되기 전에 쿼리를 실행할 수 없다.
2. 쿼리를 시작전 connected가 되었는지 확인해야 한다.
이 문제를 어떻게 해결할까요?

## 사전 초기화 큐를 사용하자!!
객체 내부에 큐를 만들어서 DB가 연결되지 않으면 큐에 해당하는 작업을 넣습니다.
그리고 연결이 완료되면 큐에 있는 작업들을 실행하면 됩니다.

```typescript
import { EventEmitter } from 'events';

class DB extends EventEmitter {
  connected = false;
  commandsQueue: any[] = []; // 1

  async query(queryString: string) {
    if (!this.connected) {
      console.log(`큐에 들어간 쿼리 : ${queryString}`);
      return new Promise((resolve, reject) => { // 2.
        const command = () => {
          this.query(queryString).then(resolve, reject);
        };
        this.commandsQueue.push(command);
      });
    }
    console.log('쿼리실행' + queryString);
  }

  connect() {
    setTimeout(() => {
      this.connected = true;
      this.emit('connected');
      this.commandsQueue.forEach((command) => command()); //3
      this.commandsQueue = []; //4
    }, 500);
  }
}

export const db = new DB();
```
`1번`에서 보는 것처럼 commandQueue를 만들어서 connect가 되기전에 commandQueue에 작업을 넣습니다.

`2번`에서 중요한 개념이 나오는데 Promise의 핵심인 지연실행입니다. Promise의 특징 중 하나인 resolve를 실행해야 값을 받을 수 있습니다. 즉 다시말해 resolve를 실행하지 않으면 계속 값을 받을수 없다는 거죠 이 뜻은 지연실행이 가능하다는 뜻입니다. 
그래서 query를 실행하고 나서 결과값을 나중에 받을 수 있습니다.

`3번`에서 보여준것처럼 connect가 되면서 이때 command를 실행하고 resolve를 실행시킵니다.

`4번`에서는 commandQueue를 비웁니다.

하지만 이런 방식에도 단점이 있습니다. 아직까지 쿼리함수에서는 연결이 되어있는지 확인하는 로직 때문에 비지니스 로직을 파악하는데 어려움이 있습니다. 



## 상태패턴을 사용하자!!!

이를 상태패턴을 이용해서 해결할 수 있습니다.
DB의 상태를 `Offline`과 `Online`상태를 나눠 상태의 따라 쿼리의 동작을 다르게 하면 
비지니스 로직(Online에 담겨있는)에 집중할 수 있습니다.

```typescript
import { EventEmitter } from 'events';
const deactive = Symbol('deactive');

interface State {
  query(queryString: string): any;
  [deactive]?: Function; // 1
}
```
1. state에 대해서 `Offline`일 때만 deactive를 동작시키고 싶어서 interface에서 숨겼습니다. 

### 오프라인일 때
```typescript
class OfflineState implements State {
  private commandsQueue: any[] = [];
  constructor(public db: DB) {}

  async query(queryString: string) {
    return new Promise((resolve, reject) => {
      const command = () => {
        db.query(queryString).then(resolve, reject);
      };
      this.commandsQueue.push(command);
    });
  }

  [deactive]() {
    this.commandsQueue.forEach((command) => command());
    this.commandsQueue = [];
  }
}
```

### 온라인일 때
```typescript
class OnlineState implements State {
  constructor(public db: DB) {}
  async query(queryString: string) {
    console.log('쿼리실행' + queryString);
  }
}
```
- 비지니스 로직에 집중할수 있습니다.

### DB 
```typescript
class DB extends EventEmitter {
  connected = false;
  states = {
    offline: new OfflineState(this),
    online: new OnlineState(this),
  };
  currentState: State = this.states.offline;

  async query(queryString: string) {
    this.currentState.query(queryString);
  }

  connect() {
    setTimeout(() => {
      this.connected = true;
      const oldState = this.currentState;
      this.currentState = this.states.online;
      oldState[deactive] && oldState[deactive]();
      this.emit('connected');
    }, 500);
  }
}
export const db = new DB();
```
- DB class는 2개의 상태를 가지고 연결이 되면 상태를 바꾸면서 client는 내부 로직을 모르게 DB의 query함수를 사용할수 있습니다. DX가 많이 좋아졌습니다!!!


**Recap**
* 사전초기화 큐에 task를 넣어서 connect가 되면 task를 실행한다.
* 비지니스 로직에 집중하기 위해 offline과 online 상태패턴을 이용해서 관리하자