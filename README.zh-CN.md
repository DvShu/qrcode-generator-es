# qrcode-generator-es

## 语言

[English](README.md) | 中文

## 介绍

基于 [qr-code-generator-library](https://www.nayuki.io/page/qr-code-generator-library) 的二维码生成器，支持 `tree-shaking`。

## 安装

```shell
npm install qrcode-generator-es --save
```

## 使用

```javascript
import {
  QRCodeRender,
  renderToSvg,
  renderToTable,
  renderToCanvas,
  renderToImg,
} from "./index";

const $canvas = document.getElementById("canvas");
const qrcode = new QRCodeRender({
  renderFn: renderToCanvas,
  text: "Hello World!!!",
  el: $canvas,
});
qrcode.render();
```

## 参数
| 参数名 | 类型 | 默认值 | 说明 | 必填 |
| ---- | ---- | ---- | ---- | ---- |
| `text` | `string` | - | 二维码内容, 如果不传, 则需要手动调用 `addData` 函数 | 否 |
| `size` | `number` | 100 | 生成的二维码大小 | 否 |
| `level` | `string` | `L` | 二维码纠错等级, `L` (默认)、`M`、`Q`、`H` | 否 |
| `fill` | `string` | `#000000` | 二维码填充色 | 否 |
| `background` | `string` | `#ffffff` | 二维码背景色 | 否 |
| `el` | `HTMLElement`、`string` | - | 渲染的元素, 可以是 `canvas` 或者 `img` 元素, 或者 选择器 | 否 |
| `renderFn` | `function` | - | 渲染函数 | 是 |
| `icon` | `{ src: string, size?: number }` | - | 二维码中间的图标 | 否 |

> 渲染函数
> 1. `renderToSvg`: 渲染到 `svg` 元素
> 2. `renderToTable`: 渲染到 `table` 元素
> 3. `renderToCanvas`: 渲染到 `canvas` 元素
> 4. `renderToImg`: 渲染到 `img` 元素

## 添加二维码内容
如果二维码内容初始化了后，后续会根据接口动态变化的时候，可以根据 `API` 手动调整

### 1. 添加二维码内容

```javascript
import {
  QRCodeRender,
  renderToCanvas
} from "./index";

const qrcode = new QRCodeRender({
  renderFn: renderToCanvas,
  text: "Hello",
  el: '#canvas',
});
qrcode.render();

qrcode.addData(' World')
```
### 重置二维码内容
添加二维码内容调用的是 `addData` 函数，重置则调用 `resetData` 函数

```javascript
qrcode.resetData('new data')
```
> `addData` 和 `resetData` 函数不需要手动调用 `render` 函数，会自动调用
