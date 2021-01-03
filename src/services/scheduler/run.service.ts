import SchedulerService from './scheduler.service';
const init = () => {
	try {
		const schedulerService = new SchedulerService();
		schedulerService.start();
		console.log('SchedulerService is run');
	} catch (ex) {
		console.error(`Failed to Init SchedulerService ${new Date()}, Error:${ex}`);
		process.exit(1);
	}

};

init();
