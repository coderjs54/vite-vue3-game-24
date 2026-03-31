<script setup lang="ts">
import { ref, computed, onMounted, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({ useScope: 'global' })

const Lang = 'lang'
// 读取本地关于语言的配置
const lang = localStorage.getItem(Lang) as string

if (lang) {
  locale.value = lang
}

type Flag = -1 | 0 | 1 | 2
// 最终的结果 0表示没有计算 -1表示表达式错误 1表示计算错误 2表示计算正确
const flag = ref<Flag>(0)

const operators = [
  [ '+', '+' ],
  [ '-', '-' ],
  [ '×', '*' ],
  [ '/', '/' ],
  [ '(', '(' ],
  [ ')', ')' ],
  [ '←', 'Back' ],
  [ 'C', 'Clear' ]
]

// 随机的数字
const randomNums = ref<Array<number>>([])
// [7, 7, 3, 4]  [7]
const usedNums = ref<Array<number>>([])

// 当前还可用的数字
const legalNums = computed(() => {
  // 找出没有被用过的数字
  return usedNums.value.reduce((prev, item) => {
    const index = prev.indexOf(item)
    if (index > - 1) {
      prev.splice(index, 1)
    }
    return prev
  }, [...randomNums.value])
})

// 获取随机的数字
const getRandomNums = () => {
  if (randomNums.value.length >= 4) return

  const random = Math.floor(Math.random() * 10) + 1

  randomNums.value.push(random)

  getRandomNums()
}

// 点击新游戏按钮
const reStartGame = () => {
  randomNums.value = []
  flag.value = 0
  expression.value = []
  usedNums.value = []
  getRandomNums()
}

// 计算表达式的值
const calcExpression = () => {
  if (!expressionStr.value.length) {
    return
  }

  // 判断是否已经使用了全部的数字
  if (usedNums.value.length < randomNums.value.length) {
    return
  }

  try {
    const result = new Function('return ' + expressionStr.value)()

    if (result === 24) {
      flag.value = 2
    } else {
      flag.value = 1
    }
  } catch (err) {
    flag.value = -1
  }
}

// 存储表达式的数组
const expression = ref<Array<string | number>>([])

// 点击数字或者运算符
const addExpression = (i: string | number) => {
  if (typeof i === 'string') {
    // 输入的是运算符
    if (i === 'Clear') {
      expression.value = []
      usedNums.value = []
    } else if (i === 'Back') {
      if (typeof expression.value[expression.value.length - 1] === 'number') {
        usedNums.value.pop()
      }
      expression.value.pop()
    } else {
      expression.value.push(i)
    }
  } else {
    // 输入的是数字
    usedNums.value.push(i)
    const length = expression.value.length
    if (length === 0) {
      expression.value.push(i)
    } else {
      const last = expression.value[length - 1]
      if (typeof last !== 'number') {
        expression.value.push(i)
      } else {
        // 默认使用加号连接
        expression.value.push('+')
        expression.value.push(i)
      }
    }
  }
}

const expressionStr = computed(() => {
  return expression.value.join('')
})

const resultStr = computed(() => {
  const flagVal = toValue(flag)
  if (flagVal === 0) return ''
  if (flagVal === -1) return t('message.result.error')
  if (flagVal === 1) return t('message.result.wrong')
  if (flagVal === 2) return t('message.result.correct')
})

const toggleLang = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem(Lang, locale.value)
}

onMounted(getRandomNums)
</script>

<template>
  <div class="board">
    <div class="game-title">
      <span>{{t('message.name')}}<sup>{{t('message.edition')}}</sup></span>
      <button class="toggle-lang" :title="t('message.langTip')" @click="toggleLang">
        <Transition name="slide">
          <span v-if="locale === 'en'">{{t('message.lang')}}</span>
          <span v-else>{{t('message.lang')}}</span>
        </Transition>
      </button>
    </div>
    <TransitionGroup name="list" class="chosen-box" tag="div">
      <div class="chosen-num" v-for="(num, i) in randomNums" :key="i + '-' + num">{{ num }}</div>
    </TransitionGroup>
    <div class="expression">{{ expressionStr }}</div>
    <div class="number-box">
      <div class="num-line">
        <div class="num" v-for="i in 5" :key="i">
          <button :disabled="!legalNums.includes(i)" @click="addExpression(i)">{{ i }}</button>
        </div>
      </div>
      <div class="num-line">
        <div class="num" v-for="i in [6, 7, 8, 9, 10]" :key="i">
          <button :disabled="!legalNums.includes(i)" @click="addExpression(i)">{{ i }}</button>
        </div>
      </div>
    </div>
    <div class="operator-box">
      <div class="op" v-for="(op, i) in operators" :key="i">
        <button @click="addExpression(op[1])">{{ op[0] }}</button>
      </div>
    </div>
    <div class="result-box" v-if="resultStr" :class="{correct: flag === 2}">{{ resultStr }}</div>
    <div class="operate calc-box">
      <button @click="calcExpression">{{t('message.calculate')}}</button>
    </div>
    <div class="operate new-game-box">
      <button @click="reStartGame">{{t('message.restart')}}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.board {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;

  button {
    cursor: pointer;
    font-family: var(--mono);
    transition: transform .2s linear;
  }

  button:active {
    transform: translateY(-2px) scale(1.1);
  }

  .game-title {
    position: relative;
    height: 50px;
    line-height: 50px;
    font-size: 2em;
    font-weight: bold;
    color: #6366f1;
    margin-bottom: 20px;

    sup {
      font-size: 0.5em;
    }

    .toggle-lang {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-40%);
      height: 30px;
      width: 64px;
      border-radius: 15px;
      color: #000;
      border: none;
      font-size: 14px;
      background-color: #f4e4e4;

      .slide-enter-active {
        transition: opacity 0.6s ease;
      }

      .slide-enter-from,
      .slide-leave-to {
        opacity: 0;
      }
    }
  }

  .list-enter-active {
    transition: all 1.5s ease;
  }

  .list-leave-active {
    opacity: 0;
  }

  .list-enter-from {
    opacity: 0;
    transform: translateY(60px);
  }

  .chosen-box {
    display: flex;
    height: 100px;
    gap: 20px;
    margin-bottom: 20px;

    .chosen-num {
      flex: 1;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      color: black;
      font-size: 3.2em;
      background-color: #ff9a9e;
    }
  }

  .expression {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 1.8em;
    background-color: #f093fb;
  }

  .number-box {
    padding-top: 20px;
    .num-line {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 15px;

      .num {
        flex: 1;
        height: 50px;

        button {
          width: 100%;
          height: 100%;
          border: none;
          font-size: 1.6em;
          color: white;
          border-radius: 3px;
          background-color: #667eea;
          &[disabled] {
            color: #9ca3af;
            background-color: #e5e7eb;
            &:active {
              transform: none;
            }
          }
        }
      }
    }
  }

  .operator-box {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    flex-wrap: wrap;
    .op {
      width: 20%;
      height: 50px;

      button {
        width: 100%;
        height: 100%;
        border: none;
        font-size: 1.6em;
        color: white;
        border-radius: 3px;
        background-color: #667eea;
      }
    }
  }

  .result-box {
    margin-top: 20px;
    height: 50px;
    color: #ef4444;
    border: 2px solid #ef4444;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    font-weight: bold;
    background-color: #ef44441a;

    &.correct {
      color: #10b981;
      border: #10b981;
      background-color: #10b9811a;
    }
  }

  .operate {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 25px;

    button {
      width: 100%;
      height: 100%;
      border: none;
      font-size: 1.2em;
      font-weight: bold;
    }

    &.calc-box {
      button {
        background-color: #fa709a;
      }
    }

    &.new-game-box {
      button {
        background-color: #fee140;
      }
    }
  }
}
</style>
