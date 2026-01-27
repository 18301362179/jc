// 环境变量配置（精简版，无测试环境）
const envConfig = {
    development: {
        baseUrl: 'https://www.tianjifu.com/qwxt',
        envName: '开发环境',
        debug: true
    },
    production: {
        baseUrl: 'https://www.tianjifu.com/qwxt',
        envName: '生产环境',
        debug: false
    }
}

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
module.exports = envConfig[env]