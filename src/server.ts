import App from '@/app';
import AuthRoute from '@routes/auth.route';
import HealthRoute from '@routes/health.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new HealthRoute(), new AuthRoute()]);

app.listen();
