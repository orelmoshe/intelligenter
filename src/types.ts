// @ts-ignore
export type VTData = {
	numberOfDetection: number;
	numberOfScanners: number;
	detectedEngines: string[];
	lastUpdated: string;
};

export type WhoisData = {
	dateCreated: string;
	ownerName: string;
	expriedOn: string;
};

export type Status = 'OnAnalysis' | 'Done';

export type AuditLogRequest = {
	type: string;
	domain: string;
};
