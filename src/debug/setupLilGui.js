import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export async function setupLilGui() {
  const params = { enemiesAmount: 20 };
  const gui = new GUI().title("Scene setup");

  const dom = gui.domElement;
  dom.style.position = "absolute";
  dom.style.left = "50%";
  dom.style.top = "0px";
  dom.style.transform = "translateX(-50%)";
  dom.style.width = "40vw";
  dom.style.zIndex = "9999";

  gui.add(params, "enemiesAmount", 10, 200, 10).name("Enemies per unit type");

  await new Promise((resolve) => {
    const btn = gui
      .add({ Confirm: resolve }, "Confirm")
      .name("Confirm & build");
  });

  gui.destroy();

  return { instancesPerUnit: params.enemiesAmount };
}
