import { glob } from "glob";
import * as fs from "node:fs";

// injeta glob em fs.promises ANTES do app subir
if (!(fs.promises as any).glob) {
  (fs.promises as any).glob = glob;
}
