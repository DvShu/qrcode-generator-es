# qrcode-generator-es

## Language

english | [中文](README.zh-CN.md) 

## introduce

A QR code generator based on the [Qr-code-generator-library](https://www.nayuki.io/page/qr-code-generator-library) that supports `tree-shaking`.

## install

```shell
npm install qrcode-generator-es --save
```

## use

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

## parameter
| parameter name| type| default| explain| required|
| ---- | ---- | ---- | ---- | ---- |
| `text`|`string`| - | QR code content, if not passed, you need to manually call `addData` function | `N` |
| `size` |`number`| 100 | Size of QR code generated | `N` |
| `level` |`string`|`L`| 2D code error correction level, `L` (default), `M`, `Q`, `H` | `N` |
| `fill` | `string` | `#000000` | 2D code fill color | `N` |
| `background` | `string` | `#ffffff` | 2D code background color | `N` |
| `el` |`HTMLElement`, `string`| - | The rendered element can be `canvas` or `img` element, or a selector | `N` |
| `renderFn` | `function` | - | rendering function | `Y` |
| `icon` | `{ src: string, size?: number }` | - | The icon in the middle of the QR code | `N` |

>rendering function
> 1. `renderToSvg`: render to`svg` element
> 2. `renderToTable`: render to`table` element
> 3. `renderToCanvas`: render to`canvas` elements
> 4. `renderToImg`: render to`img` element

## Add QR code content
If the content of the QR code is initialized, it will change dynamically according to the interface. You can manually adjust it according`API`

### 1. Add QR code content

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
### Reset QR code content
Add QR code content calls`addData` function, reset calls`resetData` function

```javascript
qrcode.resetData('new data')
```
>`addData`and`resetData` functions do not need to call`render` function manually, they are called automatically
