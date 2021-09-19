import { Renderer } from "./spritegl";
import "./index.css";
import css from "./canvas.module.css";

const renderer = new Renderer({
  width: 640,
  height: 480,
  className: css.appCanvas,
});

export default renderer;
