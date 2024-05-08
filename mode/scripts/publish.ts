import { $ } from 'npm:zx';

export default async function (args: CustomArgs, opts: CustomOptions) {
  await $`npm run build`;

  await $`vsce publish`;
}
