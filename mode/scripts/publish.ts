import { $ } from 'npm:zx';

export default async function (args: CustomArgs, opts: CustomOptions) {
  const { env } = opts;

  const { PUBLISHER_NAME } = env;

  //   await $`vsce login ${PUBLISHER_NAME}`;

  await $`npm run build`;

  await $`vsce publish`;
}
