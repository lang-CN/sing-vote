import { createProxyMiddleware } from 'http-proxy-middleware';

export default (req, res) => {
    let target = '';
    if (req.url.startsWith('/api')) {
        target = 'http://vote-db.langll.cn';
    }
    
    // 从环境变量获取令牌，如果不存在则使用空字符串作为默认值
    const authToken = process.env.MY_SECRET || '';
    
    // 创建代理配置
    const proxy = createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            '^/api/': '/',
        },
        headers: {
            // 使用环境变量中的令牌
            'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
    });
    
    // 执行代理
    return proxy(req, res);
};
