import PubsubService from '../pubsub';
import { subscriberUpdate } from './virusTotal.service';
import { TopicNames, SubscriberNames } from '../../consts';

const init = async (): Promise<void> => {
	try {
		const pubsubService = new PubsubService();
		await pubsubService.init(TopicNames.VT_TOPIC, SubscriberNames.VT_SUBSCRIBER);

		pubsubService.collectSub.on('message', subscriberUpdate);
		pubsubService.collectSub.on('error', (error) => console.error(error));
		console.log('VirusTotalService is run');
	} catch (ex) {
		console.error(`Failed to Init VirusTotalService ${new Date()}, Error:${ex}`);
		process.exit(1);
	}
};

init();
