# JOURNAL

## 18/12/2024
- I was trying to add a router and use finally the nextjs router with adding pages in `src/pages` and `next/link`. First add the `react-router-dom` library that was redirected to `react-router` and it seems that Yagni for the moment
- Switching from VueJs/Vitest to react testing library is a little bit painful
    - would like to test unitary my component and just check that page contains the component but i didn't found how to do it, so i have used [data-test-id](https://testing-library.com/docs/queries/bytestid/) but not sure is it a good practice
    - i had to refresh my memory with the right usage of `react-testing-library` some returns boolean, other data and maybe i should add some `async/await` sometimes. [See](https://timdeschryver.dev/blog/making-sure-youre-using-the-correct-query#byrole-provides-a-solution-to)
-  Add a simple layout for the pages, with a header, navbar and footer
   - r
- Attend a very nice [workshop](https://www.next-level.run/webinar-web-perf-bundle-optimisation) focused on three essential tools for optimizing your JavaScript code, efficiently managing your bundles and improving the performance of your React applications with Chrome's profiler, stats.json and Bundle Analyzer and React Profiling. See [https://www.fasterize.com/fr/blog/vitesse-chargement-chiffres-cles-web-performance/](https://www.fasterize.com/fr/blog/vitesse-chargement-chiffres-cles-web-performance/)

## To see next
- [ ] Choose between french and english
- [ ] Add tailwind properly to project and some ~~fancy~~ glossy css
- [ ] [Lazy loading](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)
- [ ] Should I use Memo ?
- [ ] Finish installation of https://typescript-eslint.io/getting-started
- [ ] Run type checking (add husky before ?)
