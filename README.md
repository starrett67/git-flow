# git-flow
http://git-flow.joshstarrett.com

## Description
This is a tool I made to help automate some aspects of git flow. The tool will automatically create branches and merge them depending on the type of brach (feature, hotfix, release). Merges occur using Pull Requests in github.


## Requirements
- Github Repository
- Master and develop branch in repository
- Repository OAuth Access to create PRs, branches and read access.
- Allow popups in chrome. Hotfix and Release merges will create two PR's at once and open in new tabs.

## What is gitflow?
Here is a good guide:
https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow


## Disclamer
I'm not a react expert and I set this up as a personal tool. OAuth access may not be as granular as it needs to be and not all my react code is best practice. Also, I know I need to update the endpoint to be https:// with do that in the future.
