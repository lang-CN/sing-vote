import { createProxyMiddleware } from 'http-proxy-middleware';

export default (req, res) => {
    let target = '';
    if (req.url.startsWith('/api')) {
        target = 'http://vote-db.langll.cn';
    }
    
    // 创建代理配置
    const proxy = createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            '^/api/': '/',
        },
        headers: {
            'Authorization': 'Bearer dad60b3910423ddc915e991f38c2c0d9'
        }
    });
    
    // 执行代理
    return proxy(req, res);
};