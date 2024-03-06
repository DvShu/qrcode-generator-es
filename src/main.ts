import { render } from "./index";

document.body.appendChild(
	render({ text: "Hello Wrold!!!" }) as HTMLTableElement,
);
console.log(render({ text: "Hello Wrold!!!" }));
