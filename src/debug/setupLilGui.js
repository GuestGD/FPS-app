import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { isMobile } from "../mobileControls/isMobile";

export async function setupLilGui() {
  const mobileDevice = isMobile();
  const params = { enemiesAmount: 20, pixelRatio: 1.3 };
  const gui = new GUI().title("Scene setup");

  const dom = gui.domElement;
  dom.style.position = "absolute";
  dom.style.left = "50%";
  dom.style.top = "0px";
  dom.style.transform = "translateX(-50%)";
  dom.style.zIndex = "9999";
  dom.style.width = "40vw";

  gui.add(params, "enemiesAmount", 10, 200, 10).name("Enemies per unit type");

  if (mobileDevice) {
    dom.style.width = "100vw";

    gui
      .add(params, "pixelRatio", 1.0, devicePixelRatio, 0.1)
      .name("Pixel ratio");
  }

  await new Promise((resolve) => {
    const btn = gui
      .add({ Confirm: resolve }, "Confirm")
      .name("Confirm & build");
  });

  gui.destroy();

  return {
    instancesPerUnit: params.enemiesAmount,
    pixelRatio: params.pixelRatio,
  };
}
