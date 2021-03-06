import { version } from '../../package.json';
import { Router } from 'express';
import microServiceMiddleware from '../middleware/microServce';
import { withAuth, login, userCRUD, withPermission, userManagement } from '../middleware/auth.js';

const {
	MS_NEWS = 'http://farmaciasolidaria.ddns.net:3000',
	MS_LOCATION = 'https://farmaciasolidaria-location.herokuapp.com',
	MS_MEDICINE = 'https://farmaciasolidaria-medicine.herokuapp.com'
} = process.env

const api = ({ config, db }) => {
	const api = Router();

	api.use('/login', login())
	api.use('/me', userManagement())
	api.use('/user', userCRUD())

	// Setup News Middleware
	if (MS_NEWS)
		api.use('/news', microServiceMiddleware({ method: 'GET', url: MS_NEWS + '/wp-json/wp/v2/posts' }))

	// Setup News Middleware
	if (MS_LOCATION) {
		api.use('/location',  withPermission('read:location'), microServiceMiddleware({ method: 'GET', url: MS_LOCATION + '/pontos_de_apoio' }))
		api.use('/location', withPermission('write:location'), microServiceMiddleware({ method: ['POST', 'PUT', 'DELETE'], url: MS_LOCATION + '/pontos_de_apoio' }))
	}
	// Setup Medicine Middleware
	if (MS_MEDICINE) {
		api.use('/medicine/stock', microServiceMiddleware({ url: MS_MEDICINE + '/estoque/acrescentar-ao-estoque' }))
		api.use('/medicine/request', microServiceMiddleware({ url: MS_MEDICINE + '/solicitacao' }))
		api.use('/medicine/types', microServiceMiddleware({ url: MS_MEDICINE + '/tipos' }))
		api.use('/medicine/status', microServiceMiddleware({ url: MS_MEDICINE + '/status' }))
		api.use('/medicine', microServiceMiddleware({ method: 'GET', url: MS_MEDICINE + '/medicamentos' }))
		api.use('/medicine', withPermission('write:medicine'), microServiceMiddleware({ method: ['POST', 'PUT', 'DELETE'], url: MS_MEDICINE + '/medicamentos' }))
	}

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}

export default api