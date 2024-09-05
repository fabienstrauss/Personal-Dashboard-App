const express = require('express');
const cors = require('cors');
const stockRoutes = require('./routes/stocks');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/stocks', stockRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
