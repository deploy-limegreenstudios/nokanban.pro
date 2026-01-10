export default {
  '*': ['biome check --write --no-errors-on-unmatched --files-ignore-unknown=true'],
  '*.{ts,tsx,js,jsx,vue}': ['biome check --write --organize-imports-enabled=true'],
}
