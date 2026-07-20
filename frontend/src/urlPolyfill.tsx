// urlPolyfill.ts
if (typeof URL === "undefined") {
  (globalThis as any).URL = class {
    href: string;
    constructor(path: string, base: string = "") {
      const baseDir = base.toString().replace(/[^/]*$/, "");
      this.href = path.startsWith("/") || path.includes("://")
        ? path
        : baseDir + path;
    }
  };
}