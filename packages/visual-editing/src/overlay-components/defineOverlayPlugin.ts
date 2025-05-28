import type {OverlayComponentResolverContext, OverlayPluginDefinition} from '../types'

/**
 * @public
 * Helper type to check if an object has required keys
 */
export type HasRequiredKeys<T> = Record<string, never> extends T ? false : true

/**
 * @public
 */
export type OverlayPluginUserFnConfigOptions<O extends Record<string, unknown>> =
  HasRequiredKeys<O> extends true ? {options: O} : {options?: O}

/**
 * @public
 */
export type OverlayPluginUserFnConfig<O extends Record<string, unknown>> = {
  guard?: OverlayPluginDefinition['guard']
} & OverlayPluginUserFnConfigOptions<O>

/**
 * @public
 */
export type OverlayPluginUserFn<O extends Record<string, unknown>> =
  HasRequiredKeys<O> extends true
    ? (config: OverlayPluginUserFnConfig<O>) => OverlayPluginDefinition
    : (config?: OverlayPluginUserFnConfig<O>) => OverlayPluginDefinition

/**
 * @public
 */
export type OverlayPluginDefineFn<O extends Record<string, unknown>> = (
  options: O,
) => OverlayPluginDefinition

/**
 * @public
 * Define an overlay plugin with conditional options parameter.
 * Adds a guard that combines the user-provided guard with the plugin's guard.
 */
export function defineOverlayPlugin<O extends Record<string, unknown> = Record<string, never>>(
  pluginDefinitionFn: OverlayPluginDefineFn<O>,
): OverlayPluginUserFn<O> {
  return ((config: Parameters<OverlayPluginUserFn<O>>[0] | undefined) => {
    const {guard: pluginGuard, ...pluginDefinition} = pluginDefinitionFn(
      config?.options ?? ({} as O),
    )
    return {
      ...pluginDefinition,
      guard: (context: OverlayComponentResolverContext) => {
        const pluginGuardResult = pluginGuard?.(context)

        if (pluginGuardResult === false) {
          return false
        }

        return config?.guard?.(context)
      },
    }
  }) as OverlayPluginUserFn<O>
}
