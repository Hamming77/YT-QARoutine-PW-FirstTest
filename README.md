## ADD TYPE CHECKING AND LINITING TO A PLAYWRIGHT PROJECT

<a href="https://playwright.dev/docs/test-typescript">PLAYWRIGHT DOCS: TypeScript</a>

<a href="https://www.youtube.com/watch?v=3gT7LuzqOAk">Add type checking and linting to your Playwright project</a>

As Playwright does not check the types, it will run tests even if there are non-critical TypeScript compilation errors

Therefore, it is recommended to run TypeScript compiler alongside Playwright to perform type check and also linting our code to prevent specific Playwright errors like missing awaits when necessary or introducing them when they are not required

Most importantly, realize about all of them before spending time on executing the whole testsuite

1. Install TypeScript in the project as a dependency:

    ```sh
    npm install --save-dev typescript
    ```
2. Create a new TypeScript config file:

    ```sh
    npx tsc --init
    ```
3. Run TypseScript compiler, <code>--noEmit</code> will only do the type checking without emitting JavaScript files, <code>-p</code> compiles the project given the path to its configuration file, or to a folder with a <code>'tsconfig.json'</code>, <code>-w</code> watch mode to realize about errors when saving the files:
    ```sh
    npx tsc -p tsconfig.json --noEmit -w
    ```
4. We can also edit <code>package.json</code> file so that we can run the compiler automatically before executting the test command, just by typing <code>npm run test</code> command in the console, as it is annotated with the <code>pre</code> prefix:
    ```json:package.json
    "scripts": {
        "pretest": "tsc --noEmit",
        "test": "playwright test"
    },
    ```
5. Install *typescript-eslint*, that sits on top of *eslint* a very common JavaScript linter but enriched with specific TypeScript features:

    ```sh
    npm install --save-dev eslint @eslint/js typescript typescript-eslint
    ```
6. Create a new configuration file in the root folder <code>"eslint.config.mjs"</code>

    ```js:eslint.config.mjs
    	import eslint from '@eslint/js';
	import tseslint from 'typescript-eslint';

	export default tseslint.config(
	  eslint.configs.recommended,
	  tseslint.configs.recommended,
	  {
	    languageOptions: {
	    parserOptions: {
	        project: true,
	        tsconfigRootDir: ".",
	      },
	    },
	    rules : {
	        "@typescript-eslint/no-floating-promises": "error",
	        "@typescript-eslint/await-thenable": "error"
	    }
	  }
	);
    ```
7. Run typescript-eslint:
    ```sh
    npx eslint tests/**
    ```
8. Modify <code>package.json</code> file so both compiler and linter are runn before the tests:

    ```json:package.json
    "scripts": {
        "pretest": "tsc --noEmit && eslint tests/**",
        "test": "playwright test"
    },
    ```

## RUN PLAYWRIGHT TESTS WITH GITHUB ACTIONS INSIDE DOCKER

<a href="https://playwright.dev/docs/ci-intro">PLAYWRIGHT DOCS: Setting up CI</a>

<a href="https://playwright.dev/docs/ci">PLAYWRIGHT DOCS: Continuous Integration</a>

1. Create a new public repo: YT-QARoutine-PW
2. In VSCode navigate to the parent folder

    ```sh
        cd C:\SRC\COURSES\YOUTUBE\QARoutine
    ```
3. Clone repo to local machine:

    ```sh
        git clone https://github.com/Hamming77/YT-QARoutine-PW-FirstTest.git
    ```

4. Navigate to the created local folder:

    ```sh
        cd /YT-QARoutine-PW-FirstTest.git
    ```    

5. Install needed SW in the created folder

    ```sh
        npm init playwright@latest
    ```    

	When installing Playwright don't forget to add a <code>.yaml</code> file for Github Actions

6. When installed, edit playwright.yml file to ensure that tests execution is only triggered on every Push in the **main** branch and not with every Pull Request:

    ```yml
        name: Playwright Tests
        on:
            push:
                branches: [ main ]
        jobs:
            test:
                timeout-minutes: 60
                runs-on: ubuntu-latest
                steps:
                - uses: actions/checkout@v4
                - uses: actions/setup-node@v4
                with:
                    node-version: lts/*
                - name: Install dependencies
                run: npm ci
                - name: Install Playwright Browsers
                run: npx playwright install --with-deps
                - name: Run Playwright tests
                run: npx playwright test
                - uses: actions/upload-artifact@v4
                if: ${{ !cancelled() }}
                with:
                    name: playwright-report
                    path: playwright-report/
                    retention-days: 30
    ```

7. Run test locally

    ```sh
    npx playwright run
    ```

8. Push changes to Github. Go to Actions tab in Github and check that test execution has been automatically triggered

9. Make a test fail and push the changes. Check test has failed in Actions, and the 2 retry attempts

10. Change playwright.yml in order to run the tests in Docker containers:

    ```yml
        name: Playwright Tests
        on:
            push:
                branches: [ main ]
        jobs:
            playwright:
                name: 'Playwright Tests'
                runs-on: ubuntu-latest
                container:
                    image: mcr.microsoft.com/playwright:v1.49.1-noble
                    options: --user 1001
                steps:
                - uses: actions/checkout@v4
                - uses: actions/setup-node@v4
                    with:
                        node-version: lts/*
                - name: Install dependencies
                    run: npm ci
                - name: Run your tests
                    run: npx playwright test
    ```                    

11. Fix the test to pass again and push all the changes

12. It will trigger as many executions as .yaml file are existing inside <code>workflows</code> folder, so it can be useful to setup different workflows with different configurations

## SHARDING WITH MERGED REPORTS
<a href="https://playwright.dev/docs/test-sharding">PLAYWRIGHT DOCS: Sharding</a>

<a href="https://playwright.dev/docs/test-parallel">PLAYWRIGHT DOCS: Parallelism</a>

<a href="https://playwright.dev/docs/test-reporters">PLAYWRIGHT DOCS: Test Reporters</a>

 By default, Playwright runs test files in parallel for optimal utilization of CPU cores on local machine. In order to achieve even greater parallelisation, tests can be run on multiple machines simultaneously. We call this mode of operation *sharding:* splitting your tests into smaller parts called *shards* that are like separate jobs that can run independently. 
 
 In a CI pipeline, each shard can run as a separate job, making use of the hardware resources available in your CI pipeline, like CPU cores, to run tests faster.

Sharding can be done at two levels of granularity depending on whether you use the testProject.fullyParallel option or not.

- If <code>true</code>: Playwright Test runs individual tests in parallel across multiple shards, ensuring each shard receives an even distribution of tests. This allows for test-level granularity, meaning each shard will attempt to balance the number of individual tests it runs.

- If <code>false</code>:  Playwright Test defaults to file-level granularity, meaning entire test files are assigned to shards. In this case, the number of tests per file can greatly influence shard distribution. If your test files are not evenly sized, certain shards may end up running significantly more tests

As each test shard has its own test report, if a combined report showing all the test results from all the shards is required, we must generate them in BLOB format to allow merging them after execution:
    
```ts 
        /* Reporter to be used. If running in CI, BLOB format to allow sharding. If in local, in HTML. See https://playwright.dev/docs/test-reporters */
        export default defineConfig({
            testDir: './tests',
            reporter: process.env.CI ? 'blob' : 'html',
        });
```

A .yml file must be created inside <code>.github\workflows</code> folder in order to run our tests in **GitHub Actions**. An example of such a file:

```yml
name: 100 Playwright Tests with Sharding
on:
  push:
    branches: [ main ]
jobs:
  playwright-tests:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        # Array of the shard numbers
        shardIndex: [1, 2, 3, 4, 5, 6, 7, 8]
        # Total number of shards we want to create
        shardTotal: [8]
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright browsers
      run: npx playwright install --with-deps

    - name: Run Playwright tests
      run: npx playwright test tests/example.spec.ts --repeat-each 50 --project=chromium --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}

    - name: Upload blob report to GitHub Actions Artifacts
      if: ${{ !cancelled() }}
      uses: actions/upload-artifact@v4
      with:
        name: blob-report-${{ matrix.shardIndex }}
        path: blob-report
        retention-days: 1
  # After all shards have completed, run a separate job to merge reports after playwright-tests, even if some shards have failed
  merge-reports:
    if: ${{ !cancelled() }}
    # To ensure the execution order, we make the merge-reports job depend on our sharded "playwright-tests" previous job
    needs: [playwright-tests]

    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci

    - name: Download blob reports from GitHub Actions Artifacts
      uses: actions/download-artifact@v4
      with:
        path: all-blob-reports
        pattern: blob-report-*
        merge-multiple: true

    # Reads all blob reports from the passed directory and merges them into a single report.
    - name: Merge into HTML Report
      run: npx playwright merge-reports --reporter html ./all-blob-reports

    - name: Upload HTML report
      uses: actions/upload-artifact@v4
      with:
        name: html-report--attempt-${{ github.run_attempt }}
        path: playwright-report
        retention-days: 14
```
