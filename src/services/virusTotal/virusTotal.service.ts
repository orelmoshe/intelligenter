import axios from 'axios';
import axiosRetry from 'axios-retry';
import dotenv from 'dotenv';
import AxiosService from '../axios.service';
import DBService from '../db';
import { HttpCodes, Status } from '../../consts';
import { VTData } from '../../types';

dotenv.config();
const prefix = 'https://www.virustotal.com/vtapi/v2';
const apiKey = process.env.API_KEY_VIRTUS_TOTAL;
const ApiRoutes = {
	GET_URL_TABLE: `${prefix}/url/report?apikey=${apiKey}`,
};

class VirusTotalService {
	private static instance: VirusTotalService;
	private axiosService;

	public constructor() {
		if (VirusTotalService.instance) {
			return VirusTotalService.instance;
		}
		this.axiosService = new AxiosService();
		VirusTotalService.instance = this;
	}

	public async getURLTable(url: string): Promise<any> {
		try {
			console.log(`Trying to get Url table for domain: ${url}`);

			let response = await this.axiosService.get(ApiRoutes.GET_URL_TABLE + `&resource=${url}`);
			if (response.status === HttpCodes.RATE_LIMIT) {
				const retryDelay = (retryNumber = 0) => {
					const seconds = Math.pow(2, retryNumber) * 1000;
					const randomMs = 1000 * Math.random();
					return seconds + randomMs;
				};

				axiosRetry(axios, {
					retries: 2,
					retryDelay,
					// retry on Network Error & 5xx responses
					retryCondition: axiosRetry.isRetryableError,
				});
				response = await this.axiosService.get(ApiRoutes.GET_URL_TABLE + `&resource=${url}`);
			}
			console.log(`Final to get Url table for domain: ${url} , data: ${JSON.stringify(response.data)}`);
			return response.data;
		} catch (ex) {
			const err: string = `Failed while trying to get Url table for domain from virusTotal api, Error:${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public async updateDataByDomain(url: string): Promise<void> {
		try {
			console.log(`Trying to update virus total data for domain: ${url}`);
			const response = await this.getURLTable(url);
			if (!response?.response_code) {
				console.log(`Not exists virus total data for ${url}`);
				return;
			}
			const dbService = new DBService();
			const detectedEngines: string[] = Object.keys(response.scans).reduce((acc: string[], nextKey: string) => {
				if (response.scans[nextKey].detected) {
					return acc.concat(nextKey);
				}
				return acc;
			}, []);
			const data: VTData = {
				numberOfDetection: response?.positives,
				numberOfScanners: response?.total,
				detectedEngines,
				lastUpdated: response?.scan_date,
			};
			const newData = await dbService.updateDomain(url, { VTData: data });
			if (newData.WhoisData && newData.status === Status.ON_ANALYSIS) {
				await dbService.updateDomain(url, { status: 'Done' });
			}
			console.log(`Final to update virus total data for domain: ${url}`);
		} catch (ex) {
			const err: string = `Failed while trying to update Data By Domain from virusTotal api, Error:${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}
}

export const subscriberUpdate = async (message: any): Promise<void> => {
	try {
		console.log(`start virusTotal subscriber`, message?.data.toString());
		const dbService = new DBService();
		await dbService.connection();
		const virusTotalService = new VirusTotalService();
		await virusTotalService.updateDataByDomain(message?.data.toString());
		await message.ack();
		console.log(`Final virusTotal subscriber`);
	} catch (ex) {
		const err: string = `Failed while trying to start subscriberUpdate function from virusTotal api, Error:${JSON.stringify(ex)}`;
		console.error(err);
		await message.ack();
		throw err;
	}
};

export default VirusTotalService;
