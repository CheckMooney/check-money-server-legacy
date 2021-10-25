module.exports = {
  apps: [
    {
      name: 'app',
      script: './app.js',
      instances: 0,
      exec_mode: 'cluster',
      // wait_ready: true,
      // listen_timeout: 50000,
      // kill_timeout: 5000,
    },
  ],
};

//pm2 start ecosystem.config.js
//pm2 start ecosystem.config.js --watch --no-daemon
//pm2 scale app +4
//pm2 scale app 4
//pm2 reload app
//pm2 restart app
//  ㄴkill and start. so use "reload"
//pm2 kill
//pm2 logs
//pm2 monit
