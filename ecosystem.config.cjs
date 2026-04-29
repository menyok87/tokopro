module.exports = {
  apps: [
    {
      name: 'tokopro-server',
      script: 'server/app.js',
      cwd: '/var/www/keuangan/tokopro',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/tokopro-error.log',
      out_file: '/var/log/pm2/tokopro-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
