import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: './test/setup.ts'
}
export default config;
