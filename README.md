# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


### 部署步骤

1. 安装Cloudflare Wrangler CLI：
   ```bash
   npm install -g wrangler
   ```

2. 登录Cloudflare账号：
   ```bash
   wrangler login
   ```

3. 创建D1数据库：
   ```bash
   wrangler d1 create signature-db
   ```

4. 替换`wrangler.toml`中的`database_id`为实际ID

5. 部署Worker：
   ```bash
   wrangler deploy
   ```