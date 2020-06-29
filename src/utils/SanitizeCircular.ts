import { Game } from "../models/Game";
import { inspect } from 'util'
import _ from "lodash";


// export function sanitizeCircular(object: any){
//   return inspect(object);
// }

// export function sanitizeCircular(object: any){
//   return _.cloneDeep(object);
// }

export function sanitizeCircular(object: any){
    let deepClonedSanitizedObject = JSON.parse(JSON.stringify(object, getCircularReplacer()));

    return deepClonedSanitizedObject;
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: any, value: any) => {
      //Add console log statements to try to understand why winners array being nullified.
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };