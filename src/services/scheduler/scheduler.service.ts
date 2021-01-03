import { CronJob } from 'cron';
import { Status, TopicNames } from '../../consts';
import PubsubService from '../pubsub';
import DBService from '../db';

class SchedulerService {
	private static instance: SchedulerService;
	private cronJob: CronJob;

	public constructor() {
		if (SchedulerService.instance) {
			return SchedulerService.instance;
		}
		this.cronJob = new CronJob('0 0 1 * *', async () => {
			try {
				console.log(`Trying to create new CronJob, ${new Date()}`);
				await this.jobEveryMonth();
				console.log(`Final to create new CronJob, ${new Date()}`);
			} catch (ex) {
				const err = `Failed while trying to definition CronJob function, Error : ${JSON.stringify(ex)}`;
				console.error(err);
				process.exit(1);
			}
		});
		SchedulerService.instance = this;
	}

	private async jobEveryMonth(): Promise<void> {
		try {
			console.log(`Trying to scan all domain, ${new Date()}`);
			const dbService = new DBService();
			await dbService.connection();
			const items = await dbService.getAll();
			if (!items.length) {
				console.log('DB is empty');
				return;
			}
			const pubsub = new PubsubService();
			const vtTopic = await pubsub.getTopicIFExists(TopicNames.VT_TOPIC);
			const whoisTopic = await pubsub.getTopicIFExists(TopicNames.WHOIS_TOPIC);
			let vtPromises = [];
			let WIPromises = [];
			if (vtTopic) {
				vtPromises = items.map((item) => {
					if (item.domain.length > 0 && item.VTData && item.WhoisData && item.status === Status.DONE) {
						return vtTopic.publish(Buffer.from(item.domain));
					}
				});
			}
			if (whoisTopic) {
				WIPromises = items.map((item) => {
					if (item.domain.length > 0 && item.VTData && item.WhoisData && item.status === Status.DONE) {
						return whoisTopic.publish(Buffer.from(item.domain));
					}
				});
			}
			if (vtPromises.length || WIPromises.length) {
				console.log('Start update data');
				await Promise.allSettled([...vtPromises, ...WIPromises]);
				console.log('End update data');
			} else {
				console.log('Not exists data for update');
			}
			console.log(`Final to scan all domain and update data in DB, ${new Date()}`);
		} catch (ex) {
			const err: string = `Failed while trying to scan all domain in SchedulerService, Error:${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public start(): void {
		if (!this.cronJob?.running) {
			this.cronJob.start();
		}
	}
}

export default SchedulerService;
