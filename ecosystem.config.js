module.exports = {
	apps: [
		{
			name: 'main',
			script: './dist/index.js',
			watch: true,
			exec_mode: 'cluster_mode',
			instances: 1,
		},
		{
			name: 'virusTotal-service',
			script: './dist/services/virusTotal/run.service.js',
			watch: true,
			exec_mode: 'cluster_mode',
			instances: 1,
		},
		{
			name: 'whois-service',
			script: './dist/services/whois/run.service.js',
			watch: true,
			exec_mode: 'cluster_mode',
			instances: 1,
		},
		{
			name: 'scheduler-service',
			script: './dist/services/scheduler/run.service.js',
			watch: true,
			exec_mode: 'cluster_mode',
			instances: 1,
		},
	],

	deploy: {
		production: {
			user: 'SSH_USERNAME',
			host: 'SSH_HOSTMACHINE',
			ref: 'origin/master',
			repo: 'GIT_REPOSITORY',
			path: 'DESTINATION_PATH',
			'pre-deploy-local': '',
			'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
			'pre-setup': '',
		},
	},
};
