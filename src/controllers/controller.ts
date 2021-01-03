import { Request, Response } from 'express';
import joi from '@hapi/joi';
import NodeCache from 'node-cache';
import { IDomain } from '../models/domain.model';
import { HttpCodes, TopicNames, Status, ErrorMessage, Methods } from '../consts';
import DBService from '../services/db';
import { isDomainValid } from '../utils/validations.util';
import PubsubService from '../services/pubsub';

const myCache = new NodeCache();
const TTL = 300; // 300 seconds = 5 minutes
class Controller {
	private static instance: Controller;

	public constructor() {
		if (Controller.instance) {
			return Controller.instance;
		}
		Controller.instance = this;
	}

	public async getResultsByDomain(req: Request, res: Response): Promise<any> {
		try {
			console.log(`Trying to get stored data on a domain`);
			const schema = joi.object().keys({
				domain: joi.string().required(),
			});

			const result = schema.validate(req.query);

			if (result.error) {
				throw result?.error?.message;
			}
			const domain = req.query.domain as string;
			console.log(`Domain is ${domain}`);
			if (!isDomainValid(domain)) {
				throw ErrorMessage.DOMAIN_NOT_VALID;
			}
			const db = new DBService();
			if (myCache.has(domain)) {
				const responseCache = myCache.get(domain);
				await db.createNewAuditLog({ type: Methods.GET, domain }, responseCache);
				console.log(`Final to get stored data on a domain from Cache`);
				return res.status(HttpCodes.OK).json(responseCache);
			}
			const item: IDomain = await db.getDetailsDomain(domain);
			console.log('item :>> ', item);
			if (!item || item?.status === Status.ON_ANALYSIS) {
				const isExists = await db.checkIfExistsDomain(domain);
				if (!isExists) {
					console.log('item is not exists, so try to created');
					await db.createNewDomain(domain);
				}
				console.log('start send to subscriptions, getResultsByDomain function in controller');
				const pubsub = new PubsubService();
				const vtTopic = await pubsub.getTopicIFExists(TopicNames.VT_TOPIC);
				vtTopic && (await vtTopic.publish(Buffer.from(domain)));
				const whoisTopic = await pubsub.getTopicIFExists(TopicNames.WHOIS_TOPIC);
				whoisTopic && (await whoisTopic.publish(Buffer.from(domain)));
				await db.createNewAuditLog({ type: Methods.GET, domain }, Status.ON_ANALYSIS);
				myCache.set(domain, Status.ON_ANALYSIS, TTL);
				return res.status(HttpCodes.OK).json(Status.ON_ANALYSIS);
			}
			await db.createNewAuditLog({ type: Methods.GET, domain }, item);
			myCache.set(domain, item, TTL);
			console.log(`Final to get stored data on a domain`);
			res.status(HttpCodes.OK).json(item);
		} catch (ex) {
			const err: string = `Failed while trying to get stored data on a domain, Error:${JSON.stringify(ex)}`;
			console.error(err);
			res.status(HttpCodes.ERROR).json(err);
		}
	}
	public async scanDomain(req: Request, res: Response): Promise<any> {
		try {
			console.log(`Trying to scan domain`);
			const schema = joi.object().keys({
				domain: joi.string().required(),
			});

			const result = schema.validate(req.body);

			if (result.error) {
				throw result.error.message;
			}
			const domain = req.body.domain as string;
			console.log(`Domain is: ${domain}`);
			if (!isDomainValid(domain)) {
				throw ErrorMessage.DOMAIN_NOT_VALID;
			}
			const db = new DBService();
			if (myCache.has(domain)) {
				const responseCache = myCache.get(domain);
				await db.createNewAuditLog({ type: Methods.POST, domain }, responseCache);
				console.log(`Final to get stored data on a domain from Cache`);
				return res.status(HttpCodes.OK).json(responseCache);
			}
			const item: IDomain = await db.getDetailsDomain(domain);
			if (item) {
				console.log(`${domain} domain is exists`);
				await db.createNewAuditLog({ type: Methods.POST, domain }, { domain, status: item.status });
				myCache.set(domain, { domain, status: item.status }, TTL);
				return res.status(HttpCodes.OK).json({ domain, status: item.status });
			}
			const isExists = await db.checkIfExistsDomain(domain);
			if (!isExists) {
				await db.createNewDomain(domain);
			}
			console.log('start send to subscriptions, scanDomain function in controller');
			const pubsub = new PubsubService();
			const vtTopic = await pubsub.getTopicIFExists(TopicNames.VT_TOPIC);
			vtTopic && (await vtTopic.publish(Buffer.from(domain)));
			const whoisTopic = await pubsub.getTopicIFExists(TopicNames.WHOIS_TOPIC);
			whoisTopic && (await whoisTopic.publish(Buffer.from(domain)));

			await db.createNewAuditLog({ type: Methods.POST, domain }, Status.ON_ANALYSIS);
			myCache.set(domain, { domain, status: Status.ON_ANALYSIS }, TTL);
			console.log(`Final to scan domain`);
			res.status(HttpCodes.OK).json({ domain, status: Status.ON_ANALYSIS });
		} catch (ex) {
			const err: string = `Failed while trying to get stored data on a domain, Error:${JSON.stringify(ex)}`;
			console.error(err);
			res.status(HttpCodes.ERROR).json(err);
		}
	}
}

export default Controller;
