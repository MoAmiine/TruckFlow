const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/error.middleware.js');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const camionRoutes = require('./routes/camion.routes.js');
const remorqueRoutes = require('./routes/remorque.routes.js');
const pneuRoutes = require('./routes/pneu.routes.js');
const trajetRoutes = require('./routes/trajet.routes');
const healthRoutes = require('./routes/health.routes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger.yaml');
const { v1Governance, v2Governance } = require('./middlewares/governance.middleware');
const v2Routes = require('./routes/v2');

const app = express();
app.use(express.json());
app.use(cors());
app.set('trust proxy', 1);

app.use('/healthz', healthRoutes);

app.get('/', (req, res) => {
    res.json('app is working')
})

app.use('/api/v1', v1Governance);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/camions', camionRoutes);   
app.use('/api/v1/remorques', remorqueRoutes);
app.use('/api/v1/pneus', pneuRoutes);
app.use('/api/v1/trajets', trajetRoutes);
app.use('/api/v2', v2Governance, v2Routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandler);


module.exports = app



