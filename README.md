<!-- omit in toc -->

# 🚀 threeSBML

> **Three js batched mesh animations + lod system.**

---

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [How to import animations](#-features)
- [Usage Examples](#-usage-examples)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- Individual units independent animation while each unit is just an instance of one batched mesh
- Create custom events linked to a certain animation frame
- Create any custom logic based on distance from a unit or it's state (alive, dead, injured, etc.)
- Animation LOD - set distance threshold to make animation simpler reducing gpu work
- Geometry LOD - set distance threshold to use simpler geometry seamlessly while preserving a current animation frame
- Use texture arrays to set textures for each unit type inside a shader efficiently
- One material supports up to 7 unit types with any amount of instances for each (browser available RAM is a limit)

---

## 🏁 Quick Start

## 🏁 How to import animations

Animations must be exported as a flat Float32Array of matrices. There are several ways of doing this:

1. The easiest way - use my [Blender addon](URL) . I really recommend using this approach to simplify your pipeline. The addon exports desired units animations allowing to pick a step, creating transition animations for all animation combinations in addition. Also it exports a tiny JS helper with lines of code you can just copy-paste into your project to set animation frames and transition animations.
2. You can manually play an animation of a typical skinned mesh in any three js project and write bones matrices of desired animations for needed frames. Then export it to any format you prefer.
3. Any other way you want.

The final result must be Float32Array containing bones matrices for all desired frames of unit's animations. For example:

- A character has 50 bones. Each bones has 4x4 matrix so 50*16 = 800. It means each 800 values of this Float32Array is 1 frame of the character animations. Combine all animations frames into one array this way.

### Installation

```bash
npm install
```
