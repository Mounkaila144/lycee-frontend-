module.exports = {
  apps: [
    {
      name: 'lycee-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/lycee-front',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      error_file: './logs/app-error.log',
      out_file: './logs/app-out.log',
      log_file: './logs/app-combined.log',
      time: true,
      merge_logs: true
    }
  ]
};
