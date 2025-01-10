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