import chai from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';
import Domain from '../models/domain.model';
import AuditLog from '../models/auditLog.model';
import server from '../index';

chai.use(chaiHttp);
chai.should();
describe('Domains', () => {
	beforeEach((done) => {
		//Before each test we empty the database
		Domain.remove({}, (err) => {
			Domain.create(
				{
					domain: 'google.com',
					status: 'OnAnalysis',
					VTData: { numberOfDetection: 2, numberOfScanners: 70, detectedEngines: ['CLEAN MX'], lastUpdated: '09.09.19' },
					WhoisData: { dateCreated: '09.15.97', ownerName: 'MarkMonitor, Inc.', expriedOn: '09.13.28' },
				},
				(err) => {
					AuditLog.remove({}, (err) => {
						done();
					});
				}
			);
		});
	});
	/*
	 * Test the /GET route
	 */
	describe('/GET Results by domain', () => {
		it('it should GET the Results by domain', (done) => {
			chai
				.request(server)
				.get('/getResultsByDomain?domain=google.com')
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.eql('OnAnalysis');
					done();
				});
		});
	});
	it('it should not GET the Results by domain', (done) => {
		chai
			.request(server)
			.get('/getResultsByDomain?domain=google')
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.eql('Failed while trying to get stored data on a domain, Error:"Domain not valid"');
				done();
			});
	});
	/*
	 * Test the /POST route
	 */
	describe('/POST scanDomain', () => {
		it('it should POST a scan Domain', (done) => {
			let domain = {
				domain: 'google.com',
			};
			chai
				.request(server)
				.post('/scanDomain')
				.send(domain)
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
		it('it should not POST a scan Domain', (done) => {
			let domain = {
				domain: 'google',
			};
			chai
				.request(server)
				.post('/scanDomain')
				.send(domain)
				.end((err, res) => {
					res.should.have.status(500);
					done();
				});
		});
	});
});
