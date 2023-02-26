import { promises as fs } from "fs";

const assetTypes = [
  {
    suffix: "png",
    dir: "textures",
    typeName: "TextureName",
  },
  {
    suffix: "mp3",
    dir: "sounds",
    typeName: "SoundName",
  },
];

const preamble = `//
// FILE IS AUTOMATICALLY GENERATED.
//
// Use 'npm run buildAssets' to regenerate.
//`;

async function buildAssetIndex({ suffix, dir, typeName }: (typeof assetTypes)[number]) {
  const files = (await fs.readdir(`./src/assets/${dir}`)).filter((f) => f.endsWith(`.${suffix}`));

  const importLines = files.map((f) => `import ${f.split(".")[0]} from "./${f}";`);
  const exportLine = `export const ${dir} = { ${files.map((f) => f.split(".")[0]).join(", ")} };`;
  const exportTypeLine = `export type ${typeName} = keyof typeof ${dir};`;

  const contents = `${preamble}\n\n${importLines.join("\n")}\n\n${exportLine}\n\n${exportTypeLine}\n`;

  fs.writeFile(`./src/assets/${dir}/index.ts`, contents);

  console.log(`built ${files.length} ${dir}.`);
}

async function main() {
  assetTypes.forEach(buildAssetIndex);
}

main();
