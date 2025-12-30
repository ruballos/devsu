import sequelize from './shared/database/database.js'
import { usersRouter } from "./users/router.js"
import express from 'express'

const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())
app.get('/healthz', (req, res) => res.status(200).send('ok'))
app.use('/devsu/api/users', usersRouter)


//evitamos sync/listen en tests
let server = null
if (process.env.NODE_ENV !== 'test') {
  sequelize
    .sync({ force: true })
    .then(() => console.log('db is ready'))
    .catch((err) => console.error('db sync error', err))

  server = app.listen(PORT, () => {
    console.log('Server running on port', PORT)
  })
}

export { app, server }