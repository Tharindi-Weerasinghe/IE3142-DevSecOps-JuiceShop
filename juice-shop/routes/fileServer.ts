/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

import { challenges } from '../data/datacache'
import * as challengeUtils from '../lib/challengeUtils'

export function servePublicFiles () {
  return ({ params, query }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    if (!file.includes('/')) {
      verify(file, res, next)
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }

  function verify (file: string, res: Response, next: NextFunction) {
  if (file.includes('%00') || file.includes('\0')) {
    res.status(403)
    next(new Error('Poison Null Byte sequences are not allowed!'))
    return
  }

  if (file && (endsWithAllowlistedFileType(file) || (file === 'incident-support.kdbx'))) {
    const safeFile = path.basename(file)
    const ftpRoot = path.resolve('ftp')

    challengeUtils.solveIf(challenges.directoryListingChallenge, () => { return safeFile.toLowerCase() === 'acquisitions.md' })

    res.sendFile(safeFile, { root: ftpRoot })
  } else {
    res.status(403)
    next(new Error('Only .md and .pdf files are allowed!'))
  }
}


  function endsWithAllowlistedFileType (param: string) {
    return param.endsWith('.md') || param.endsWith('.pdf')
  }
}
