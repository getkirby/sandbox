# Kirby Sandbox

The Kirby Sandbox is our local test environment. We use this to work on Kirby and switch between different types of sites and test scenarios. We recommend this setup for all contributors

## Installation

```
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

We recommend to setup a `sandbox.test` virtual host for your shiny new sandbox
