# JOURNAL


## 23/12/2024
Some error `Error: Invalid Chai property: toHaveAttribute ` with testing library, Custom jest matchers and vitest, types were not recognized... 😭 The jest setup files inferno !
Fixed with this [solution](https://stackoverflow.com/questions/77611978/invalid-chai-property-in-vitest) but, have a failed to import problem with vite () that was caused by the fact that when I installed `└──> npm install --save-dev testing-library/jest-dom ───┘` there was no package version number but the link to the github repository, maybe there was a problem with installed version in node_modules. Whatever happened, it works now.

## 18/12/2024
- I was trying to add a router and use finally the nextjs router with adding pages in `src/pages` and `next/link`. First add the `react-router-dom` library that was redirected to `react-router` and it seems that Yagni for the moment
- Switching from VueJs/Vitest to react testing library is a little bit painful
    - would like to test unitary my component and just check that page contains the component but i didn't found how to do it, so i have used [data-test-id](https://testing-library.com/docs/queries/bytestid/) but not sure is it a good practice
    - i had to refresh my memory with the right usage of `react-testing-library` some returns boolean, other data and maybe i should add some `async/await` sometimes. [See](https://timdeschryver.dev/blog/making-sure-youre-using-the-correct-query#byrole-provides-a-solution-to)
-  Add a simple layout for the pages, with a header, navbar and footer
   - Typescript
   - ...to continue
- Attend a very nice [workshop](https://www.next-level.run/webinar-web-perf-bundle-optimisation) focused on three essential tools for optimizing your JavaScript code, efficiently managing your bundles and improving the performance of your React applications with Chrome's profiler, stats.json and Bundle Analyzer and React Profiling. See [https://www.fasterize.com/fr/blog/vitesse-chargement-chiffres-cles-web-performance/](https://www.fasterize.com/fr/blog/vitesse-chargement-chiffres-cles-web-performance/)

## To see next
- [ ] Choose between french and english
- [ ] Add tailwind properly to project and some ~~fancy~~ glossy [css](https://nextjs.org/docs/app/getting-started/css-and-styling) 
- [ ] [Lazy loading](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)
- [ ] Should I use Memo ?
- [ ] Finish installation of https://typescript-eslint.io/getting-started
- [ ] Run type checking (add husky before ?)

## Later
- [ ] Where do i store data ? First a file read/write with fs and then add a database with knex as a query builder or another (should ask the React community) https://github.com/vercel/next.js/tree/canary/examples/with-knex 