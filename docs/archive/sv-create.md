# יצירת פרויקט חדש עם `sv create`

אני שומר כאן את הפקודה של `sv create` המלאה, כדי שאוכל להשתמש בה בעתיד:

```sh
bun x sv@latest create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright tailwindcss="plugins:none" sveltekit-adapter="adapter:cloudflare+cfTarget:workers" devtools-json mcp="ide:claude-code,cursor,gemini,opencode,vscode,other+setup:remote" --install bun .
```
