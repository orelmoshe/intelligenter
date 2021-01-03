import dotenv from 'dotenv';
import AxiosService from '../axios.service';
import DBService from '../db';
import { Status } from '../../consts';
import { WhoisData } from '../../types';

dotenv.config();
const prefix = 'https://www.whoisxmlapi.com';
const apiKey = process.env.API_KEY_WHOIS;
const ApiRoutes = {
	GET_WHOIS_SERVICE: `${prefix}/whoisserver/WhoisService?apiKey=${apiKey}`,
};
class WhoisService {
	private static instance: WhoisService;
	private axiosService;

	public constructor() {
		if (WhoisService.instance) {
			return WhoisService.instance;
		}
		this.axiosService = new AxiosService();
		WhoisService.instance = this;
	}

	public async getWhoisData(url: string): Promise<any> {
		try {
			console.log(`Trying to get Whois Data for domain: ${url}`);
			const response = await this.axiosService.get(ApiRoutes.GET_WHOIS_SERVICE + `&domainName=${url}&outputFormat=JSON`);
			console.log(`Final to get whois data for domain: ${url} , data: ${JSON.stringify(response.data)}`);
			return response.data;
		} catch (ex) {
			const err: string = `Failed while trying to get Whois Data for domain from whois api, Error:${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public async updateDataByDomain(url: string): Promise<void> {
		try {
			console.log(`Trying to update whois data for domain: ${url}`);
			const response = await this.getWhoisData(url);
			if (!response?.WhoisRecord?.parseCode) {
				console.log(`Not exists whois data for ${url}`);
				return;
			}
			const dbService = new DBService();

			const data: WhoisData = {
				dateCreated: response?.WhoisRecord?.registryData?.createdDate,
				expriedOn: response?.WhoisRecord?.registryData?.expiresDate,
				ownerName: response?.WhoisRecord?.registrarName,
			};
			const newData = await dbService.updateDomain(url, { WhoisData: data });
			if (newData.WhoisData && newData.status === Status.ON_ANALYSIS) {
				await dbService.updateDomain(url, { status: 'Done' });
			}
			console.log(`Final to update whois data for domain: ${url}`);
		} catch (ex) {
			const err: string = `Failed while trying to update Data By Domain from whois api, Error:${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}
}

export const subscriberUpdate = async (message: any): Promise<void> => {
	try {
		console.log(`start whois subscriber`, message?.data.toString());
		const dbService = new DBService();
		await dbService.connection();
		const whoisService = new WhoisService();
		await whoisService.updateDataByDomain(message?.data.toString());
		await message.ack();
		console.log(`Final whois subscriber`);
	} catch (ex) {
		const err: string = `Failed while trying to start subscriberUpdate function from whois api, Error:${JSON.stringify(ex)}`;
		console.error(err);
		await message.ack();
		throw err;
	}
};

export default WhoisService;
