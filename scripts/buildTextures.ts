import { promises as fs } from "fs";

const preamble = `//
// FILE IS AUTOMATICALLY GENERATED.
//
// Use 'npm run buildTextures' to regenerate.
//`;

async function main() {
  const files = await fs.readdir("./src/assets/textures");

  const importLines = files.map((f) => `import ${f.split(".")[0]} from "../assets/textures/${f}";`);
  const exportLine = `export const textures = { ${files.map((f) => f.split(".")[0]).join(", ")} };`;
  const exportTypeLine = "export type TextureName = keyof typeof textures;";

  const contents = `${preamble}\n\n${importLines.join("\n")}\n\n${exportLine}\n\n${exportTypeLine}\n`;

  fs.writeFile("./src/engine/textures.ts", contents);
  console.log(files);
}

main();
