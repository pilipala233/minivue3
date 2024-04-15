 import { createRender } from "../../lib/guide-mini-vue.esm.js";
import {App} from "./App.js";
console.log(PIXI)

const game = new PIXI.Application();
await game.init({ width: 640, height: 360 });
document.body.append(game.view);

const renderer = createRender({
    createElement: (type) => {
        if (type === 'rect') {
            const rect = new PIXI.Graphics();
            rect.beginFill(0xff0000);
            rect.drawRect(0, 0, 100, 100);
            rect.endFill();
            return rect;
        }
    },
    patchProp: (el, key, Value) => {
        el[key] = Value;

    },
    insert: (child, parent) => {
        parent.addChild(child);
       
    },

});
renderer.createApp(App).mount(game.stage);
// const rootContainer = document.querySelector("#app");

// createApp(App).mount(rootContainer);
