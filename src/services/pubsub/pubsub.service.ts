import { PubSub } from '@google-cloud/pubsub';
import dotenv from 'dotenv';
dotenv.config();

class PubsubService {
	private pubsub;
	public collectSub;

	public constructor() {
		this.pubsub = new PubSub();
	}

	public async init(topicName: string, subscriberName: string): Promise<void> {
		try {
			console.log(`Start pubsub init function,topicName: ${topicName}, subscriberName: ${subscriberName}`);
			const topic = await this.createNewTopic(topicName);
			console.log(`Topic ${topic.name} created.`);
			const subscription = await this.createNewSubscription(topic, subscriberName);
			this.collectSub = subscription;
			console.log(`subscription ${subscriberName} created.`);
			console.log('Final pubsub init function');
		} catch (ex) {
			const err = `Failed while trying to start pubsub init function, Error : ${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	private async createNewTopic(topicName: string): Promise<any> {
		try {
			console.log(`Trying to create new ${topicName} Topic`);
			const currentTopic = await this.getTopicIFExists(topicName);
			console.log('currentTopic :>> ', currentTopic);
			if (currentTopic) {
				console.log(`${topicName} is exists, so not created again`);
				return currentTopic;
			}
			const [topic] = await this.pubsub.createTopic(topicName);
			console.log(`Final to create new Topic ${topic.name}`);
			return topic;
		} catch (ex) {
			const err = `Failed while trying to create new topic in gcp, Error : ${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	private async createNewSubscription(topic: any, subscriberName: string): Promise<any> {
		try {
			console.log(`Trying to create new Subscriber`);
			const currentSubscriber = await this.getSubscriberIFExists(topic?.name, subscriberName);
			if (currentSubscriber) {
				console.log(`${subscriberName} is exists on ${topic?.name} topic, so not created again`);
				return currentSubscriber;
			}
			const [subscription] = await topic.createSubscription(subscriberName);
			console.log(`Subscriber created.`);
			return subscription;
		} catch (ex) {
			const err = `Failed while trying to create new Subscriber in gcp, Error : ${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public async getTopicIFExists(topicName: string): Promise<any> {
		try {
			console.log(`Trying to check if topic name: ${topicName} is exists in gcp`);
			const [topics] = await this.pubsub.getTopics();
			console.log('topics :>> ', topics);
			if (!topics.length) {
				console.log(`${topicName} not exists and empty arr topics`);
				return null;
			}
			const currentTopic = topics.find((topic) => topic.name.endsWith(topicName));
			if (!currentTopic) {
				console.log(`${topicName} not exists`);
				return null;
			}
			console.log(`${topicName} is exists`);
			return currentTopic;
		} catch (ex) {
			const err = `Failed while trying to check if topic name is exists in gcp, Error : ${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public async getSubscriberIFExists(topicName: string, subscriberName: string): Promise<any> {
		try {
			console.log(`Trying to check if subscriber name: ${subscriberName} on ${topicName} topic is exists in gcp`);
			const [subscriptions] = await this.pubsub.getSubscriptions(topicName);
			console.log('subscriptions :>> ', subscriptions);
			if (!subscriptions.length) {
				console.log(`${subscriberName} not exists and empty arr subscriptions on ${topicName} topic`);
				return null;
			}
			const currentSubscriber = subscriptions.find((subscriber) => subscriber.name.endsWith(subscriberName));
			if (!currentSubscriber) {
				console.log(`${subscriberName} not exists on ${topicName} topic`);
				return null;
			}
			console.log(`${subscriberName} is exists on ${topicName} topic`);
			return currentSubscriber;
		} catch (ex) {
			const err = `Failed while trying to check if topic name is exists in gcp, Error : ${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}
}

export default PubsubService;
