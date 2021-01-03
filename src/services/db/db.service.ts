import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Domain, { IDomain } from '../../models/domain.model';
import AuditLog from '../../models/auditLog.model';
import { AuditLogRequest } from '../../types';
dotenv.config();

class DBService {
	private static instance: DBService;
	private connectionString: string;

	public constructor() {
		if (DBService.instance) {
			return DBService.instance;
		}
		this.connectionString = process.env.DATA_BASE;
		DBService.instance = this;
	}

	public async connection(): Promise<void> {
		try {
			await mongoose.connect(this.connectionString, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
			console.log(`Successfully connected to DB`);
		} catch (ex) {
			const err = `Failed while try to connecting to database, Error: ${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public async getDetailsDomain(domain: string): Promise<IDomain> {
		try {
			console.log(`Trying to get details domain: ${domain}`);
			const item = await Domain.findOne({ domain });
			if (!item) {
				console.log(`${domain} domain not Found`);
				return null;
			}
			console.log(`Final to get Details Domain, ${item}`);
			return item;
		} catch (ex) {
			const err: string = `Failed while try to get Details Domain,  by DB service, Error:${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public async createNewDomain(domain: string): Promise<void> {
		const session = await mongoose.startSession();
		await session.startTransaction();
		try {
			console.log(`Trying to create new domain object, ${domain}`);
			const domainObj = new Domain({
				domain,
				status: 'OnAnalysis',
				VTData: null,
				WhoisData: null,
			});

			const option = { session };
			// i need check why save({session}) not working
			await domainObj.save();
			await session.commitTransaction();
			session.endSession();
			console.log(`Final to create new domain object, ${domain}`);
		} catch (ex) {
			const err: string = `Failed while try to create new Domain,  by DB service, Error:${JSON.stringify(ex)}`;
			console.error(err);
			await session.abortTransaction();
			await session.endSession();
			throw err;
		}
	}

	public async checkIfExistsDomain(domain: string): Promise<boolean> {
		try {
			console.log(`Trying to get check If Exists domain: ${domain}`);
			const item = await Domain.findOne({ domain });
			if (!item) {
				console.log(`${domain} domain not Found`);
				return false;
			}
			console.log(`Final to check If Exists Domain, ${item}`);
			return true;
		} catch (ex) {
			const err: string = `Failed while try to check If Exists Domain,  by DB service, Error:${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public async getAll(): Promise<IDomain[]> {
		try {
			console.log(`Trying to get all domains`);
			const items = await Domain.find({});
			if (!items.length) {
				console.log(`Not exist domains`);
				return [];
			}
			console.log(`Final to get all domains`);
			return items;
		} catch (ex) {
			const err: string = `Failed while try to get all domains,  by DB service, Error:${JSON.stringify(ex)}`;
			console.error(err);
			throw err;
		}
	}

	public async updateDomain(domain: string, query: any): Promise<Partial<IDomain>> {
		const session = await mongoose.startSession();
		await session.startTransaction();
		try {
			console.log(`Trying to update domain object, ${domain}, query: ${JSON.stringify(query)}`);
			// i need check why add session to options object not working
			const newData = await Domain.findOneAndUpdate({ domain }, query, { upsert: true, new: true, setDefaultsOnInsert: true });
			if (!newData) {
				console.log(`The update ${domain} domain failed`);
				return null;
			}
			await session.commitTransaction();
			session.endSession();
			console.log(`Final to update domain object, ${domain}`);
			return newData;
		} catch (ex) {
			const err: string = `Failed while try to update Domain,  by DB service, Error:${JSON.stringify(ex)}`;
			console.error(err);
			await session.abortTransaction();
			await session.endSession();
			throw err;
		}
	}

	public async createNewAuditLog(request: AuditLogRequest, response: any): Promise<void> {
		const session = await mongoose.startSession();
		await session.startTransaction();
		try {
			console.log(`Trying to create new  AuditLog object`, request, response);
			const auditLog = new AuditLog({
				request,
				response,
			});
			const option = { session };
			// i need check why save({session}) not working
			await auditLog.save();
			await session.commitTransaction();
			session.endSession();
			console.log(`Final to create new AuditLog object`);
		} catch (ex) {
			const err: string = `Failed while try to create new AuditLog,  by DB service, Error:${JSON.stringify(ex)}`;
			console.error(err);
			await session.abortTransaction();
			await session.endSession();
			throw err;
		}
	}
}

export default DBService;
