import { Renderer } from "./spritegl";
import "./index.css";
import css from "./canvas.module.css";

const renderer = new Renderer({
  width: 1440,
  height: 1080,
  className: css.appCanvas,
});

export default renderer;
