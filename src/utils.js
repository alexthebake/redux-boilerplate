export function mergeConfigs(args, config) {
  let finalArgs = { ...args };
  if (_.has(args, 'config')) {
    finalArgs = {
      ...finalArgs,
      config: { ...args.config, ...config }
    };
  } else {
    finalArgs.config = config;
  }
  return finalArgs;
}
