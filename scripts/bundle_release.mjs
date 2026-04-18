/**
 * bundle_release.mjs
 *
 * 在执行 `pnpm build` 前，临时修改项目文件（如替换 CDN tag、版本号等），
 * 构建完成后无论成功与否，自动恢复所有文件到原始状态。
 *
 * 典型用途：
 *   - 将正则/配置文件中的 <<TAG>> 占位符替换为 CDN 仓库的最新整数 tag
 *   - 临时修改角色卡 index.yaml 的版本号、世界书名称、正则启用状态等
 *   - 构建完成后重命名导出文件
 *
 * 运行方式：pnpm bundle
 *
 * 用户须知：
 *   1. 在 TODO [配置] 处填写目标 CDN 仓库 URL（用于获取最新整数 tag）
 *   2. 在 patchFiles() 中实现"构建前需要临时修改哪些文件"
 *   3. 在 restoreFiles() 中实现"构建完成后恢复哪些文件"
 *   4. 在主流程末尾按需实现"重命名导出文件"逻辑
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// TODO [配置] 填写用于获取最新整数 tag 的 GitHub 仓库地址（HTTPS clone URL）
// 该仓库的整数 tag 将作为 CDN 版本号，替换文件中的 <<TAG>> 占位符。
// 示例：'https://github.com/yourname/your-cdn-repo.git'
const TARGET_REPO_URL = '';

function step(msg) {
  console.log(`\n[bundle] ${msg}`);
}

function run(cmd, cwd = ROOT) {
  console.log(`  > ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

/**
 * 通过 git ls-remote 获取目标仓库的最新整数 tag 号。
 * 若仓库尚无整数 tag，返回 0。
 * 需要先在上方配置 TARGET_REPO_URL。
 */
function fetchLatestTag() {
  if (!TARGET_REPO_URL) {
    console.warn('  [警告] TARGET_REPO_URL 未配置，跳过 tag 获取，返回 0');
    return 0;
  }
  const output = execSync(`git ls-remote --tags ${TARGET_REPO_URL}`, { encoding: 'utf-8' });
  const intTags = output
    .split('\n')
    .map(line => line.match(/refs\/tags\/(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number);
  return intTags.length > 0 ? Math.max(...intTags) : 0;
}

/**
 * 生成 yyMMDD 格式的日期字符串（如 260418）
 */
function getDateSuffix() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  return `${yy}${MM}${DD}`;
}

/**
 * 将文本中的 <<TAG>> 替换为 tag 号，并输出实际 URL（如有）。
 */
function patchTagPlaceholder(text, latestTag, label) {
  const patched = text.replaceAll('<<TAG>>', String(latestTag));
  console.log(`  已将 <<TAG>> 替换为 ${latestTag}（${label}）`);
  const actualUrl = patched.match(/https?:\/\/\S+/)?.[0] ?? '（未找到 URL）';
  console.log(`  ${label} URL: ${actualUrl}`);
  return patched;
}

// ---------------------------------------------------------------------------
// TODO [实现] 在此处声明需要临时修改的文件路径，并用 readFileSync 读取原始内容，
// 以便在 restoreFiles() 中还原。例如：
//
//   const INDEX_YAML = join(ROOT, 'chars', 'MyChar', 'index.yaml');
//   let originalIndexYaml;
//
//   const STATUS_BAR_TXT = join(ROOT, 'chars', 'MyChar', '正则', '[美化]状态栏.txt');
//   let originalStatusBarTxt;
// ---------------------------------------------------------------------------

/**
 * 构建前：读取原始内容并临时修改文件。
 * @param {number} latestTag - 目标仓库最新整数 tag
 * @param {string} dateSuffix - 当日日期后缀（yyMMDD 格式）
 */
function patchFiles(latestTag, dateSuffix) {
  // TODO [实现] 在此处读取原始内容并对文件进行临时修改，例如：
  //
  // 1. 替换正则文件中的 <<TAG>> 占位符：
  //   originalStatusBarTxt = readFileSync(STATUS_BAR_TXT, 'utf-8');
  //   writeFileSync(STATUS_BAR_TXT, patchTagPlaceholder(originalStatusBarTxt, latestTag, '状态栏'), 'utf-8');
  //
  // 2. 修改 index.yaml 的版本号、世界书名称、正则启用状态等：
  //   originalIndexYaml = readFileSync(INDEX_YAML, 'utf-8');
  //   writeFileSync(INDEX_YAML, patchYaml(originalIndexYaml, dateSuffix), 'utf-8');
}

/**
 * 构建后：恢复所有被临时修改的文件到原始状态。
 * 此函数在 finally 块中调用，无论构建成功与否都会执行。
 */
function restoreFiles() {
  // TODO [实现] 在此处恢复所有被临时修改的文件，例如：
  //
  //   if (originalIndexYaml !== undefined) writeFileSync(INDEX_YAML, originalIndexYaml, 'utf-8');
  //   if (originalStatusBarTxt !== undefined) writeFileSync(STATUS_BAR_TXT, originalStatusBarTxt, 'utf-8');
  //   console.log('  已恢复文件');
}

// --- 主流程 ---
(() => {
  const dateSuffix = getDateSuffix();

  step('获取目标仓库最新 tag...');
  const latestTag = fetchLatestTag();
  console.log(`  当前最新 tag: ${latestTag}`);

  step('临时修改文件...');
  patchFiles(latestTag, dateSuffix);

  try {
    step('执行 pnpm build...');
    run('pnpm build');

    // TODO [可选] 构建成功后，对 export/ 目录中的输出文件进行重命名，例如：
    //   import { existsSync, renameSync } from 'node:fs'; // 需在顶部导入
    //   const exportDir = join(ROOT, 'export');
    //   const srcPng = join(exportDir, 'MyChar.png');
    //   const dstPng = join(exportDir, `MyChar_${dateSuffix}.png`);
    //   if (existsSync(srcPng)) renameSync(srcPng, dstPng);

    step('完成！');
  } finally {
    step('恢复原始文件...');
    restoreFiles();
  }
})();
