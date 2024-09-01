/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { HttpContext } from '@adonisjs/core/http'

import { middleware } from './kernel.js'

import AuthController from '#controllers/auth_controller'
import FilesController from '#controllers/files_controller'

router.get('/auth', [AuthController, 'verify'])

router
  .get('/', async (ctx: HttpContext) => {
    return ctx.user
  })
  .use(middleware.auth())

router
  .group(() => {
    router
      .group(() => {
        router.post('store', [FilesController, 'store'])
        router.post('update', [FilesController, 'update'])
        router.post('delete', [FilesController, 'delete'])
      })
      .prefix('file')
  })
  .prefix('action')
  .use(middleware.action())
