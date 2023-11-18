/*
 * @adonisjs/inertia
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { configProvider } from '@adonisjs/core'
import { RuntimeException } from '@poppinss/utils'
import type { ApplicationService } from '@adonisjs/core/types'

import InertiaMiddleware from '../src/inertia_middleware.js'
import type { InertiaConfig, ResolvedConfig } from '../src/types.js'

/**
 * Inertia provider
 */
export default class InertiaProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Registers edge plugin when edge is installed
   */
  protected async registerEdgePlugin() {
    try {
      const edgeExports = await import('edge.js')
      const { edgePluginInertia } = await import('../src/plugins/edge.js')

      edgeExports.default.use(edgePluginInertia())
    } catch {}
  }

  /**
   * Register Inertia bindings
   */
  async register() {
    const inertiaConfigProvider = this.app.config.get<InertiaConfig>('inertia')

    /**
     * Resolve config
     */
    const config = await configProvider.resolve<ResolvedConfig>(this.app, inertiaConfigProvider)
    if (!config) {
      throw new RuntimeException(
        'Invalid "config/inertia.ts" file. Make sure you are using the "defineConfig" method'
      )
    }

    /**
     * Register the Inertia middleware
     */
    this.app.container.singleton(InertiaMiddleware, () => new InertiaMiddleware(config))

    await this.registerEdgePlugin()
  }
}
