import mongoose, { Schema, Document } from 'mongoose';
import { VTData, WhoisData, Status } from '../types';

export interface IDomain extends Document {
	domain: string;
	status: Status;
	VTData: VTData;
	WhoisData: WhoisData;
}

const DomainSchema: Schema = new Schema(
	{
		domain: { type: String, required: true, unique: true },
		status: { type: String, required: true },
		VTData: {
			numberOfDetection: { type: Number },
			numberOfScanners: { type: Number },
			detectedEngines: { type: [String] },
			lastUpdated: { type: String },
		},
		WhoisData: {
			dateCreated: { type: String },
			ownerName: { type: String },
			expriedOn: { type: String },
		},
	},
	{ timestamps: true }
);

const Domain = mongoose.model<IDomain>('Domain', DomainSchema);

export default Domain;
