module.exports = {
  apps: [{
    name: 'phil-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/opt/phil-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
