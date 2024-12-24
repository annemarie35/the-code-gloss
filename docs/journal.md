# JOURNAL

## To see next

- [ ] Choose between french and english
- [x] Add tailwind properly to project and some ~~fancy~~ glossy [css](https://nextjs.org/docs/app/getting-started/css-and-styling)
- [ ] [Lazy loading](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)
- [ ] Should I use Memo ?
- [x] Finish installation of https://typescript-eslint.io/getting-started
- [x] Run type checking (add husky before ?)

## Later

- [ ] Where do I store data ? First a file read/write with fs and then add a database with knex as a query builder or another (should ask the React community) https://github.com/vercel/next.js/tree/canary/examples/with-knex

## 24/12/2024

Add some style to the pages, improve the nav venue and make tailwind work on all pages.
Still something not working with tailwind on production [https://the-code-gloss.osc-fr1.scalingo.io](https://the-code-gloss.osc-fr1.scalingo.io)

Now that I have some components and the beginning of the form, let's go back to tools. Just finished the config for **prettier** and add **husky** to pre-commit.
I keep using next lint instead of **eslint** for the moment, see that [discussion about the difference between next lint and eslint](https://github.com/vercel/next.js/discussions/36440) for config if I decide to change that.

Wondering what is that .mjs extension

> The .mjs extension makes the file use the ES modules (ESM) format. Node interprets .js files in the CommonJS (CJS) format by default, but if you have "type": "module" in your package.json, you can also use eslint.config.js.
> [source](https://typescript-eslint.io/getting-started/)

## 23/12/2024

Some error `Error: Invalid Chai property: toHaveAttribute ` with testing library, Custom jest matchers and vitest, types were not recognized... 😭 The jest setup files inferno !
Fixed with this [solution](https://stackoverflow.com/questions/77611978/invalid-chai-property-in-vitest) but, have a failed to import problem with vite () that was caused by the fact that when I installed `└──> npm install --save-dev testing-library/jest-dom ───┘` there was no package version number but the link to the github repository, maybe there was a problem with installed version in node_modules. Whatever happened, it works now.

I check then that css was working fine with tailwind, so i just add a background and some style on h1 to do so

Then I add the form, don't want to use react-form-hook or another library for the moment. Saw somebody on linkedin writing that using the `useActionState` hook can be a simple way to do it. So it is ok for me to start somewhere, I will use it and test it.

> The useActionState hook allows you to update component state based on the result of a form action. Essentially, it provides a way to manage state that is tied to form submissions, giving you greater control and flexibility over how your forms behave.
> [source](https://medium.com/zestgeek/understanding-the-useactionstate-hook-in-react-real-life-examples-f1d2350d4932)
>
> Talking about tests baby, reading [Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) may help.

## 18/12/2024

- I was trying to add a router and use finally the nextjs router with adding pages in `src/pages` and `next/link`. First add the `react-router-dom` library that was redirected to `react-router` and it seems that Yagni for the moment
- Switching from VueJs/Vitest to react testing library is a little bit painful
    - would like to test unitary my component and just check that page contains the component but i didn't found how to do it, so i have used [data-test-id](https://testing-library.com/docs/queries/bytestid/) but not sure is it a good practice
    - i had to refresh my memory with the right usage of `react-testing-library` some returns boolean, other data and maybe i should add some `async/await` sometimes. [See](https://timdeschryver.dev/blog/making-sure-youre-using-the-correct-query#byrole-provides-a-solution-to)
- Add a simple layout for the pages, with a header, navbar and footer
    - Typescript
    - ...to continue
- Attend a very nice [workshop](https://www.next-level.run/webinar-web-perf-bundle-optimisation) focused on three essential tools for optimizing your JavaScript code, efficiently managing your bundles and improving the performance of your React applications with Chrome's profiler, stats.json and Bundle Analyzer and React Profiling. See [https://www.fasterize.com/fr/blog/vitesse-chargement-chiffres-cles-web-performance/](https://www.fasterize.com/fr/blog/vitesse-chargement-chiffres-cles-web-performance/)
