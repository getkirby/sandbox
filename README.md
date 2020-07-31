# Kirby Sandbox

The Kirby Sandbox is our local test environment. We use this to work on Kirby and switch between different types of sites and test scenarios. We recommend this setup for all contributors

## Installation

```console
# clone the repo
git clone git@github.com:getkirby/sandbox.git
# step into the sandbox
cd sandbox
# initialize all submodules
git submodule update --init --recursive
# get the panel up and running
cd panel
npm i
npm run dev
```

### Host

We recommend to setup a `sandbox.test` virtual host for your shiny new sandbox. Otherwise you will need to add an .env file to /kirby/panel and change your host setup there.

## Switching environments

You can switch between the following environments:

- demokit
- starterkit
- plainkit

(There are more environments in /environments, but they are used for testing only and often don't have any usable site setup)

To switch to a new environment visit `http://sandbox.test?env=demokit` for example.

**ATTENTION: switching environments will delete all existing content, accounts and sessions in your sandbox!**

### Switching environments in Cypress

Cypress does not allow visiting URLs on different domains in the same test setup. That's why there's a little proxy route to switch environments in Cypress:

```js
cy.visit('http//localhost:8080/env/demokit);
```
