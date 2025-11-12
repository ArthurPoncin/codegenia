import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

expect.extend({ toHaveNoViolations });

if (!process.env.VITE_API_BASE_URL) {
  process.env.VITE_API_BASE_URL = "https://api.pokeforge.test";
}
