module.exports = {
    devServer: {
        proxy: {
            '/Service.svc': {
                target: 'https://localhost:32768',
                secure: false,
                changeOrigin: true,
                logLevel: 'debug',
            },
            '/UserService.svc': {
                target: 'https://localhost:32768',
                secure: false,
                changeOrigin: true,
                logLevel: 'debug',
            },
        },
    },
};
