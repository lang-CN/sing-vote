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
        onProxyReq: (proxyReq, req, res) => {
            // 确保移除可能存在的旧 Authorization 头
            proxyReq.removeHeader('Authorization');
            // 添加新的 Authorization 头
            proxyReq.setHeader('Authorization', 'Bearer dad60b3910423ddc915e991f38c2c0d9');
            
            // 调试：打印设置的请求头，确认是否正确
            console.log('Proxy headers:', proxyReq.getHeaders());
        },
    });
    
    // 执行代理
    return proxy(req, res);
};