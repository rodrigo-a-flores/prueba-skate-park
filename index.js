import express from "express";
import exphbs from 'express-handlebars';
import path from 'path';
import router from './Controllers/User.js';
import { fileURLToPath } from 'url';
import { getSkaters } from './Persistance/User.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT ?? 10000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'hbs');
app.engine(
    "hbs",
    exphbs.engine({
        extname: "hbs",
        defaultLayout: "main",
        layoutsDir: __dirname + "/views/layouts",
        partialsDir: __dirname + "/views/partials"
    })
);

app.use(router);
app.get('/', (req, res)=> {
    res.render('index');
});
app.get('/datos', (req, res)=> {
    res.render('datos');
});
app.get('/registro', (req, res)=> {
    res.render('registro');
});
app.get('/login', (req, res)=> {
    res.render('login');
});
app.get('/admin', async (req, res)=> {
    const skaters = await getSkaters(); 
    res.render('admin', { skaters });
});
app.get('*', (req, res) => {
    const error = new Error('404 - Page not found');
    res.status(404).send(`<script>alert('${error}'); window.location.href = "/";</script>`);
});
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});