# JOURNAL

## To see next

- [ ] Choose between French and english
- [x] Add tailwind properly to project and some ~~fancy~~ glossy [css](https://nextjs.org/docs/app/getting-started/css-and-styling)
- [ ] [Lazy loading](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)
- [ ] Should I use Memo ?
- [x] Finish installation of https://typescript-eslint.io/getting-started
- [x] Run type checking (add husky before ?)
- [ ] Add [renovate](https://github.com/renovatebot/renovate/blob/main/docs/usage/getting-started/installing-onboarding.md)
- [ ] Migrate to new eslint config https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
- [ ] Add GitHub action for deployment
- [ ] Add Zod validation, well, first use cases that needs Zod^^
- [ ] Add seeds to feed database
- [ ] Test with test container
- [ ] Data Fetching from db (to be removed -> api call plus maybe a backend cause we don't want secrets in client side)
- [ ] Add test to form after reading some documentation on how to do it the better way
- [ ] Fix type-checking in husky (path problem)

## 30/12/2024
- Add and fix tests (improve mocking)
- Extract fetch call to an http client instead of callint from actions
- Testing api call in forms is a nightmare...
- Discovered a bug with knex, once a I made an insert, select * returns the answer from the insert 🤡

## 27/12/2024

- Always fun with react testing library, got this error https://github.com/testing-library/dom-testing-library/issues/716
    - the form is [standard html form](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form)
    - it was fixed by adding `aria-labelledby` to label
- :recycle: Move folders to src and rearrange files structure
- :lipstick: Add some text on about page, so I start to create some reusable ui components
- :monocle_face: Since I move app and layout pages, the build is broken `You are attempting to export "metadata" from a component marked with "use client", which is disallowed.` -> https://github.com/vercel/next.js/discussions/51002
- then another error on build `webpack config.resolve.alias was incorrectly overridden. https://nextjs.org/docs/messages/invalid-resolve-alias`
    - go further with:
        - https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns
        - https://nextjs.org/docs/app/building-your-application/optimizing/metadata#static-metadata
- `Unexpected end of JSON input` https://github.com/webpack/webpack/issues/18963 -> upgraded to node v23.3.0
- new error with import of `./src/styles/globals.css`
  Global CSS cannot be imported from files other than your Custom <App>.
- playing with api and use state action
    - https://www.youtube.com/watch?v=GgyP0_b-WPY
    - fetch
    - https://dev.to/rashidshamloo/api-data-fetching-in-react-nextjs-289d
    - need to be cleaned ^^
    -

## 26/12/2024

- enabled dependabot for project https://github.com/annemarie35/the-code-gloss/settings/security_analysis
- I've been reading, cleaning notes, try for organise my toughts and how to progress with this app.
    - Adding an api call after submitting the form ? Well, finish the form before
    - Start a small Hapi server + a postgresql for training ? Add docker ? I have already done that in some past work experience and not sure if it worth it for the moment
    - Working on architecture ? Like in this tutorial https://medium.com/@martin_42533/building-a-clean-next-js-app-with-hexagonal-architecture-and-redux-7c898ac26e66 (well, I don't think I need Redux for the moment)
- Add a postgres database to project to store data
- Add Knex to make db queries
- :clown_face: Always a pleasure to have import errors like this https://github.com/oven-sh/bun/issues/7886, can't build with knex module
    - adding as suggested https://github.com/vercel/next.js/discussions/26420 this below in next.config.ts did not work so i add to install all required modules for knex...
    ```js
    const nextConfig: NextConfig = {
      experimental: {
          externalDir: true
      }
    }
    ```
- Fetch data from db on home page

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

# Done

- [x] Where do I store data ? First a file read/write with fs and then add a database with knex as a query builder or another (should ask the React community) https://github.com/vercel/next.js/tree/canary/examples/with-knex
