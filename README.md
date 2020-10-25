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
cd kirby/panel
npm i
npm run dev
```

## Virtual Host

We recommend to setup a `sandbox.test` virtual host for your shiny new sandbox and point it to the `/public` folder. Otherwise you will need to add an .env file to /kirby/panel and change your host setup there.

## Accounts

The sandbox comes with an admin account with the email `test@getkirby.com` and the password `12345678`.

You can manually log in with the user or use the route `http://sandbox.test/env/auth/test@getkirby.com` to get logged in automatically.

## Switching environments

You can switch between the following environments:

- demokit
- starterkit
- plainkit

(There are more environments in /environments, but they are used for testing only and often don't have any usable site setup)

To switch to a new environment visit `http://sandbox.test?env=demokit` for example.

**ATTENTION: switching environments will delete all existing content, accounts and sessions in your sandbox!**

### Installing accounts when switching envionments

If you switch the environment using the `?env=...` route, the `test@getkirby.com` is automatically installed to the site.

You can disable this behavior with the `?user=false` param:

```
http://sandbox.test?env=demokit&user=false
```

You can also pass a different user:

```
http://sandbox.test?env=demokit&user=yourusername
```

### Switching environments in Cypress

Cypress does not allow visiting URLs on different domains in the same test setup. That's why there's a little proxy route to switch environments in Cypress:

```js
cy.visit('http://localhost:8080/env/install/demokit);
```

For Cypress user handling there are these two routes:

```js
cy.visit('http://localhost:8080/env/user/test); // installs the test user
cy.visit('http://localhost:8080/env/auth/test@getkirby.com); // automatic login
```
