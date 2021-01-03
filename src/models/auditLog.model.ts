import mongoose, { Schema, Document } from 'mongoose';
import { AuditLogRequest } from '../types';

export interface IAuditLog extends Document {
	request: AuditLogRequest;
	response: Schema.Types.Mixed;
}

const AuditLogSchema: Schema = new Schema(
	{
		request: {
			type: { type: String, required: true },
			domain: { type: String, required: true },
		},
		response: { type: Schema.Types.Mixed, required: true },
	},
	{ timestamps: true }
);

const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
