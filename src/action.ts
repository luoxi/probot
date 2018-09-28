import { Application } from './application'
import { createDefaultCache } from './cache'
import { GitHubAPI } from './github'

const payload = require('/github/workflow/event.json')

export class ActionApplication extends Application {
  private githubToken: string

  constructor() {
    super({ app: () => '', cache: createDefaultCache() })
    const { GITHUB_EVENT, GITHUB_TOKEN } = process.env

    if (!GITHUB_EVENT) {
      throw new Error('Missing GITHUB_EVENT env variable')
    }

    if (!GITHUB_TOKEN) {
      throw new Error('Missing GITHUB_TOKEN env variable')
    }
    this.githubToken = GITHUB_TOKEN;

    const appPath = process.argv[2] || '.'
    this.load(require(appPath))

    const event = {
      id: '1',
      name: GITHUB_EVENT,
      payload
    }

    this.log.trace(event, 'Event received')
    this.receive(event).catch((err: any) => {
      // Process must exist non-zero to indicate that the action failed to run
      process.exit(1)
    })
  }

  // Override
  public async auth (): Promise<GitHubAPI> {
    const github = GitHubAPI({
      logger: this.log.child({ name: 'github' })
    })

    github.authenticate({ type: 'token', token: this.githubToken })

    return github
  }

}
