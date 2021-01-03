import PubsubService from '../pubsub';
import { subscriberUpdate } from './whois.service';
import { TopicNames, SubscriberNames } from '../../consts';

const init = async (): Promise<void> => {
	try {
		const pubsubService = new PubsubService();
		await pubsubService.init(TopicNames.WHOIS_TOPIC, SubscriberNames.WHOIS_SUBSCRIBER);

		pubsubService.collectSub.on('message', subscriberUpdate);
		pubsubService.collectSub.on('error', (error) => console.error(error));
		console.log('WhoisService is run');
	} catch (ex) {
		console.error(`Failed to Init WhoisService ${new Date()}, Error:${ex}`);
		process.exit(1);
	}
};

init();
