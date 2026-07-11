import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

function contentTypeFor(filePath: string): string {
  if (filePath.endsWith('.json')) return 'application/json'
  if (filePath.endsWith('.md')) return 'text/markdown; charset=utf-8'
  return 'application/octet-stream'
}

/** Serves repo-root content/ at /content/* during dev and preview. */
export function contentPlugin(toolRoot: string): Plugin {
  const contentDir = path.join(toolRoot, 'content')

  return {
    name: 'opik-content',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/content/')) {
          next()
          return
        }

        const relative = decodeURIComponent(url.slice('/content/'.length).split('?')[0] ?? '')
        const filePath = path.normalize(path.join(contentDir, relative))
        if (!filePath.startsWith(contentDir) || !fs.existsSync(filePath)) {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        res.statusCode = 200
        res.setHeader('Content-Type', contentTypeFor(filePath))
        res.end(fs.readFileSync(filePath))
      })
    },
  }
}

/** Workaround until C fixes quiz/EngineerFlag import path. */
export function quizContributionAliasPlugin(uiRoot: string): Plugin {
  const contributionContext = path.resolve(
    uiRoot,
    'src/features/issues/ContributionContext.tsx',
  )

  return {
    name: 'quiz-contribution-alias',
    resolveId(source, importer) {
      if (
        source === './ContributionContext' &&
        importer?.includes(`${path.sep}features${path.sep}quiz${path.sep}`)
      ) {
        return contributionContext
      }
      return null
    },
  }
}
