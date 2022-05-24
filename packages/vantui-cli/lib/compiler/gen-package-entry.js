import { join } from 'path'
import { get } from 'lodash-es'
import {
  pascalize,
  getComponents,
  smartOutputFile,
  normalizePath,
} from '../common/index.js'
import { SRC_DIR, getVantConfig } from '../common/constant.js'
function getPathByName(name, pathResolver) {
  let path = join(SRC_DIR, name)
  if (pathResolver) {
    path = pathResolver(path)
  }
  return normalizePath(path)
}
function genImports(names, pathResolver, namedExport) {
  return names
    .map((name) => {
      const pascalName = pascalize(name)
      const importName = namedExport ? `{ ${pascalName} }` : pascalName
      const importPath = getPathByName(name, pathResolver)
      return `import ${importName} from '${importPath}';`
    })
    .join('\n')
}
function genExports(names, pathResolver, namedExport) {
  if (namedExport) {
    const exports = names
      .map((name) => `export * from '${getPathByName(name, pathResolver)}';`)
      .join('\n')
    return `
  ${exports}
`
  }
  return `
  export {
    ${names.map(pascalize).join(',\n  ')}
  };
  `
}
export function genPackageEntry({ outputPath, pathResolver }) {
  const names = getComponents()
  const vantConfig = getVantConfig()
  const namedExport = get(vantConfig, 'build.namedExport', false)
  const content = `
${genImports(names, pathResolver, namedExport)}

${genExports(names, pathResolver, namedExport)}
`
  smartOutputFile(outputPath, content)
}
