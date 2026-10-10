import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
export default tseslint.config(
  {ignores:['dist/**','node_modules/**','server/data/**','public/assets/**']},
  {files:['src/**/*.{ts,tsx}'],languageOptions:{globals:globals.browser},plugins:{'react-hooks':reactHooks},rules:{'no-unused-vars':'off','@typescript-eslint/no-unused-vars':'off','react-hooks/rules-of-hooks':'error','react-hooks/exhaustive-deps':'warn'}},
  {files:['server/**/*.mjs','tests/**/*.mjs','scripts/**/*.mjs'],languageOptions:{globals:globals.node},rules:{'no-unused-vars':'off'}},
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {files:['**/*.{js,mjs,ts,tsx}'],rules:{'no-unused-vars':'off','@typescript-eslint/no-unused-vars':'off','@typescript-eslint/no-unused-expressions':'off'}},
);
