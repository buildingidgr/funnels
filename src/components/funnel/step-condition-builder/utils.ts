
import { ConditionItemType } from "./types";

export function createEmptyCondition(): ConditionItemType {
  return {
    id: crypto.randomUUID(),
    property: "",
    operator: "equals",
    value: ""
  };
}
