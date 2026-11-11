/** @type {import("prettier").Config & import("@trivago/prettier-plugin-sort-imports").PluginConfig} */
const config = {
  // ---------- Quy tắc định dạng ----------
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
  singleAttributePerLine: false,
  objectWrap: 'preserve',

  // ---------- Thứ tự import ----------
  // Thư viện > Interface|types > Constant > utils > hooks > component > config/image/svg > style
  // Lưu ý: mỗi import khớp regex ĐẦU TIÊN trong danh sách; nhóm xuất hiện đúng thứ tự mảng.
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    // 1. Thư viện (node_modules: react, next, @mui/..., v.v.)
    '<THIRD_PARTY_MODULES>',

    // 2. Interface | types
    '^@/(types|interfaces)(/.*)?$',
    '^(\\.{1,2}/)+(types|interfaces)(/.*)?$',

    // 3. Constant
    '^@/(constants?|consts?)(/.*)?$',
    '^(\\.{1,2}/)+(constants?|consts?)(/.*)?$',

    // 4. Utils
    '^@/(utils|helpers|lib|services|api)(/.*)?$',
    '^(\\.{1,2}/)+(utils|helpers|lib)(/.*)?$',

    // 5. Hooks
    '^@/hooks(/.*)?$',
    '^(\\.{1,2}/)+hooks(/.*)?$',

    // 6. Component
    '^@/(components|containers|layouts|features|modules)(/.*)?$',
    '^(\\.{1,2}/)+(components|containers|layouts)(/.*)?$',
    '^(\\.{1,2}/)+[A-Z][^/]*$',

    // 7. Config, image, svg, font, ...
    '^@/(config|configs|assets|images|icons)(/.*)?$',
    '^(\\.{1,2}/)+(config|configs|assets|images|icons)(/.*)?$',
    '\\.(png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf)$',

    // 8. Style (luôn cuối cùng)
    '\\.(css|scss|sass|less)$',
  ],
  importOrderSeparation: true, // chừa 1 dòng trống giữa các nhóm
  importOrderSortSpecifiers: true, // sắp xếp { a, b, c } bên trong import
  importOrderCaseInsensitive: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],

  // ---------- Override theo loại file ----------
  overrides: [
    { files: '*.json', options: { tabWidth: 2 } },
    { files: '*.md', options: { proseWrap: 'preserve', printWidth: 100 } },
    { files: ['*.yml', '*.yaml'], options: { singleQuote: false } },
  ],
};

export default config;
