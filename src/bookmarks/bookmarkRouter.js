const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger.js')
const { bookmarks } = require('../store.js')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        if (!bookmarks) {
            logger.error(`No bookmarks found.`)
            return res.status(404).send('No bookmarks')
        }
        res.status(200).json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description, rating } = req.body
        
        if (!title) {
            logger.error(`Title is required.`)
            res.status(404).send('Invalid data.')
        }
        if (!url) {
            logger.error(`Url is required.`)
            res.status(404).send('Invalid data.')
        }
        if (!description) {
            logger.error(`Description is required.`)
            res.status(404).send('Invalid data.')
        }
        if (!rating) {
            logger.error(`Rating is required.`)
            res.status(404).send('Invalid data.')
        }

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send(`'rating' must be a number between 0 and 5`)
          }

        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }

        bookmarks.push(bookmark)
        logger.info(`Bookmark with id of ${id} created.`)

        res
        .status(201)
        .location(`http://localhost:8000/bookmark/${id}`)
        .json(bookmark)
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params
        const bookmark = bookmarks.find(b => b.id == id)

        if(!bookmark) {
            logger.error(`No bookmark with id ${id} found.`)
            res.status(404).send('Card not found.')
        }
        res.json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params
        const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Card not found.`)
            return res
                    .status(404)
                    .send('Not found.')
        }

        bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Bookmark with id ${id} deleted.`)

        res.status(204).end()
        
        
    })

module.exports = bookmarkRouter
