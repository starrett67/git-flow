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

  async getRepos (org) {
    if (!this.repos.length > 0) {
      console.log('Getting Repos!')
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
    console.log(this.repos)
    return this.repos
  }

  async createPullRequest (repo, src, dest) {
    try {
      const pr = await this.octokit.pulls.create({
        repo: repo.name,
        owner: repo.owner.login,
        title: src.commit.commit.message,
        head: src.name,
        base: dest.name
      })
      return pr.data
    } catch (err) {
      return this.getPullRequest(repo, src, dest)
    }
  }
}
