const { Pelicula, Categorie} = require('../models/Pelicula');
const passport = require('passport');

const { getLogger } = require('@jwt/utils')
const log = getLogger(__dirname, __filename)


async function getPeliculas(req, res, next) {
    try {
        let perPage = parseInt(req.query.perPage, 10) || 9;
        let page = parseInt(req.query.page, 10) || 1;

        const peliculas = await Pelicula
            .find({})
            .populate('categories')
            .skip((perPage * page) - perPage)
            .limit(perPage);

        const count = await Pelicula.countDocuments();

        res.status(200).json(
            console.log(peliculas),{
            status: 'Api funcionando',
            peliculas,
            total: count,
            resultados: perPage
        });
    } catch (err) {
        log.error('Ups hubo un error al mostrar las peliculas! ' + err);
        res.status(500).json({
            status: 'error',
            message: 'Hubo un error al mostrar las películas'
        });
    }
}

async function getPeliculaPorId(req, res) {
    try {
        await Pelicula.findById(req.params.id, function(err, pelicula) {
            if (pelicula === null) {
                return res.status(404).json({mensaje: 'Pelicula no encontrada!'});
            }else {
                res.status(200).json({
                    status: 'Api funcionando',
                    pelicula
                });
            }
        });
    } catch (err) {
        log.error('Ups hubo un error al mostrar la Pelicula! ' + err);
    }
}

async function modificarPelicula(req, res) {
    try {
        const { id } = req.params;
        await Pelicula.update({ _id: id }, req.body);
        res.status(200).json('Pelicula Modificada con éxito!')
        log.warn('Pelicula Modificada con éxito!');
    } catch (err) {
        log.error('Ups hubo un error al modificar la pelicula! ' + err);
    }

}

async function postPelicula(req, res) {
    try {
        const pelicula = new Pelicula({
            name: req.body.name,
            description: req.body.description,
            link: req.body.link,
            images: req.body.images,
            stars: req.body.stars,
            year: req.body.year,
            gender: req.body.gender
        });
        await pelicula.save(() => {
            res.status(201).json("Pelicula agregada con éxito!");
            log.info("Peliculaagregada con éxito!");
        });
    } catch (err) {
        log.error('Ups hubo un error al agregar la pelicula! ' + err);
    }
}

async function deletePelicula(req, res) {
    try {
        await Pelicula.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                return res.send(err);
            } else {
                res.status(200).json('Pelicula Borrada con éxito!');
                log.error('Pelicula Borrada con éxito!')
            }
        });
    } catch (err) {
        log.error('Ups hubo un error al borrar la pelicula! ' + err);
    }
}

async function postCategories(req, res) {
    try {
        if (req.user.role === 'administrador') {
            const { id } = req.params;
            const newCategorie = new Categorie(req.body);
            const pelicula = await Pelicula.findById(id);
            newCategorie.pelicula = pelicula;
            await newCategorie.save();
            pelicula.categories.push(newCategorie);
            await pelicula.save(() => {
                res.status(201).json({mensaje: 'Categoria agregada con éxito a la pelicula!'});
                log.info('Categoria agregado con éxito a la Pelicula!');
            });
        } else {
            res.status(401).json({
                mensaje: 'Ups! Sin permisos. Por favor sea admin.'
            });
        }
    } catch (err) {
        log.error('Ups hubo un error!!' + err);
    }
}

async function filtroEstrella(req, res) {
    try {
        await Pelicula.find({'stars': req.params.stars}, (err, pelicula) => {
            if (pelicula <= null) {
                return res.status(404).json({
                    mensaje: 'No encontrado!',
                    peliculas: pelicula,
                    err
                });
            } else {
                res.status(200).json({
                    status: 'Filtrado por estrella OK',
                    peliculas: pelicula
                });
            }
        })
    } catch (err) {
        log.error('Ups hubo un error!');
    }
}

module.exports = {
    getPeliculas,
    getPeliculaPorId,
    modificarPelicula,
    postPelicula,
    deletePelicula,
    postCategories,
    filtroEstrella
};