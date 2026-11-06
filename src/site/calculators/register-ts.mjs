// Test helper: lets `node --experimental-strip-types` load TypeScript files that
// import each other without a ".ts" extension (as Next.js/TypeScript expect).
import { register } from "node:module";

const hooks = `
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND" && /^\\.{1,2}\\//.test(specifier)) {
      return next(specifier + ".ts", context);
    }
    throw error;
  }
}`;

register("data:text/javascript," + encodeURIComponent(hooks), import.meta.url);
