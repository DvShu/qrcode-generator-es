# qrcode-generator-es

## 介绍

基于 [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 的二维码生成器，使用 typescript 重新编写，同时支持 `tree-shaking`。

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
} from "./index";

const $canvas = document.getElementById("canvas");
const qrcode = new QRCodeRender({
  renderFn: renderToCanvas,
  text: "Hello World!!!",
  el: "#canvas",
});
qrcode.render();
```

## API

### 1. `renderToSvg`
