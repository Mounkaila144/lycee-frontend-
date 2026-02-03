module.exports = {
  apps: [
    {
      name: 'school-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/gestion-scolaire-front',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/app-error.log',
      out_file: './logs/app-out.log',
      log_file: './logs/app-combined.log',
      time: true,
      merge_logs: true
    },
    {
      name: 'webhook-server',
      script: './webhook-server.js',
      cwd: '/var/www/gestion-scolaire-front',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        NODE_ENV: 'production',
        WEBHOOK_PORT: 9002,
        WEBHOOK_SECRET: 'aa41dbc1f2fa29f3409797e42d231665544e7d56daf70426f72564f97f607e44'
      },
      error_file: './logs/webhook-error.log',
      out_file: './logs/webhook-out.log',
      log_file: './logs/webhook-combined.log',
      time: true,
      merge_logs: true
    }
  ]
};
