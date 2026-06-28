module.exports = {
  apps: [{
    name: 'report-api',
    script: 'index.js',
    cwd: '/root/report-api',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '500M',
  }]
};
