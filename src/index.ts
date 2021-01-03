import express from 'express';
import router from './routes';
import DBService from './services/db';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', router);

app.listen(process.env.PORT || PORT, async () => {
	try {
		console.log(`Server is listening on port ${PORT}`);
		const dbService = new DBService();
		await dbService.connection();
	} catch (ex) {
		console.error(ex);
		process.exit(1);
	}
});

export default app;
