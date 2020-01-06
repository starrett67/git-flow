import Octokit from '@octokit/rest'

const sortRepos = (repoA, repoB) => {
  try {
    const commitDateA = new Date(repoA.branches[0].commit.commit.author.date)
    const commitDateB = new Date(repoB.branches[0].commit.commit.author.date)
    if (commitDateA > commitDateB) return -1
    else return 1
  } catch (err) { return 0 }
}

export default class GithubData {
  constructor (token) {
    this.repos = []
    this.octokit = new Octokit({
      auth: `Bearer ${token}`
    })
  }

  async getRepos () {
    if (!this.repos.length > 0) {
      let page = 1
      let repos = []
      do {
        const response = await this.octokit.repos.list({ per_page: 100, page: page })
        this.apiCalls++
        page++
        repos = response.data
        response.data.forEach(r => {
          if (!r.archived) {
            this.repos.push(r)
          }
        })
      } while (repos.length === 100)
    }
    return this.repos.sort(sortRepos)
  }

  async getBranches (repo) {
    let branches = []
    let page = 1
    let responseCount = 0
    do {
      const response = await this.octokit.repos.listBranches({ per_page: 100, owner: repo.owner.login, repo: repo.name, page: page })
      responseCount = response.data.length
      branches = branches.concat(response.data)
      page++
    } while (responseCount === 100)
    repo.branches = branches
  }

  async getRepoBranch (repo, brancName) {
    const resp = await this.octokit.repos.getBranch({ repo: repo.name, owner: repo.owner.login, branch: brancName })
    return resp.data
  }

  async getPullRequest (repo, src, dest) {
    Object.assign(src, await this.getRepoBranch(repo, src.name))
    const pr = await this.octokit.pulls.list({
      repo: repo.name,
      owner: repo.owner.login,
      title: src.commit.commit.message,
      head: src.name,
      base: dest.name,
      state: 'open'
    })
    return pr.data[0]
  }

  async createPullRequest (repo, src, dest) {
    try {
      Object.assign(src, await this.getRepoBranch(repo, src.name))
      console.log(src)
      const pr = await this.octokit.pulls.create({
        repo: repo.name,
        owner: repo.owner.login,
        title: `Merge to ${dest.name}: ${src.commit.commit.message}`,
        head: src.name,
        base: dest.name
      })
      console.log(pr.data)
      window.open(pr.data._links.html.href)
    } catch (err) {
      console.log(err)
      if (err.message.includes('already exists')) {
        const data = await this.getPullRequest(repo, src, dest)
        console.log(data)
        window.open(data._links.html.href)
      } else {
        throw err
      }
    }
  }

  async createBranch (repo, srcBranch, branchName) {
    Object.assign(srcBranch, await this.getRepoBranch(repo, srcBranch.name))
    await this.octokit.git.createRef({
      repo: repo.name,
      owner: repo.owner.login,
      ref: `refs/heads/${branchName}`,
      sha: srcBranch.commit.sha
    })

    const branch = await this.getRepoBranch(repo, branchName)
    window.open(branch._links.html)
  }

  async mergeOperation (repo, branchType, branchName) {
    const developBranch = repo.branches.find(r => r.name === 'develop')
    const masterBranch = repo.branches.find(r => r.name === 'master')
    if (!developBranch || !masterBranch) {
      alert(`Failed to create PR please check that develop and master branch exists`)
      return Promise.resolve()
    }
    try {
      if (branchType === 'feature' || branchType === 'bugfix') {
        const mergingBranch = repo.branches.find(r => r.name === branchName)
        await this.createPullRequest(repo, mergingBranch, developBranch)
      }
      if (branchType === 'release') {
        const mergingBranch = repo.branches.find(r => r.name === branchName)
        await Promise.all([this.createPullRequest(repo, mergingBranch, developBranch), this.createPullRequest(repo, mergingBranch, masterBranch)])
      }
      if (branchType === 'hotfix') {
        const mergingBranch = repo.branches.find(r => r.name === branchName)
        await Promise.all([this.createPullRequest(repo, mergingBranch, developBranch), this.createPullRequest(repo, mergingBranch, masterBranch)])
      }
    } catch (e) {
      alert(`Failed to create PR: ${e.message}`)
    }
  }

  async createOperation (repo, branchType, branchName) {
    const developBranch = repo.branches.find(r => r.name === 'develop')
    const masterBranch = repo.branches.find(r => r.name === 'master')
    if (!developBranch || !masterBranch) {
      alert(`Failed to create PR please check that develop and master branch exists`)
      return Promise.resolve()
    }
    try {
      if (branchType === 'feature' || branchType === 'bugfix') {
        await this.createBranch(repo, developBranch, branchName)
      }
      if (branchType === 'release') {
        await this.createBranch(repo, developBranch, branchName)
      }
      if (branchType === 'hotfix') {
        await this.createBranch(repo, masterBranch, branchName)
      }
    } catch (e) {
      alert(`Failed to create Branch: ${e.message}`)
    }
  }

  async performGitFlowOperation (repo, operationType, branchType, branchName) {
    try {
      operationType = operationType.split(' ')[0].toLocaleLowerCase()
      if (operationType === 'merge') {
        this.mergeOperation(repo, branchType, branchName)
      }
      if (operationType === 'create') {
        this.createOperation(repo, branchType, branchName)
      }
    } catch (e) { }
  }
}
