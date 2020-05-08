import { Game } from "../models/Game";

export function sanitizeCircular(object: any){
    let deepClonedSanitizedObject = JSON.parse(JSON.stringify(object, getCircularReplacer()));

    return deepClonedSanitizedObject;
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: any, value: any) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };