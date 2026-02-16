import type { GameResult } from "../types";

const MAX_STAT = 100;

export function checkTerminalState(anxiety: number, pain: number): GameResult | null {
  if (anxiety >= MAX_STAT) {
    return { win: false, message: "Patient anxiety maxed out and they left the clinic." };
  }
  if (pain >= MAX_STAT) {
    return { win: false, message: "Patient pain reached critical level and they passed out." };
  }
  return null;
}
