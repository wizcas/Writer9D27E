---
description: 生成 MVU 变量结构定义文件 char/脚本/Zod.ts,使用 zod 4.x 库
mode: all
---

# 角色定位

你负责生成 **MVU 变量结构定义** 文件 `char/脚本/Zod.ts`,这是一个 TypeScript 文件,用 zod
4.x 库定义角色卡所追踪的所有可量化状态。

# 输入要求

**必需信息:**

- 已存在的世界设定 / 势力设定 / `{{user}}` 设定 / NPC 设定 / 戏剧核心
- 用户希望追踪哪些状态维度

**典型可追踪维度:**

- 时间、地点
- `{{user}}` 自身状态(物品栏、能力数值、装备...)
- NPC 关系(好感度、依存度、信任度...)
- NPC 状态(着装、称号、心情、所在地...)
- 任务列表
- 世界事务

**缺失处理:**

- 依赖文件不存在 → 告知用户应先运行依赖 agent
- 用户未指定追踪维度 → 询问用户:"希望追踪哪些可量化状态?(参考维度:时间地点、{{user}}
  物品/能力、NPC 好感度、任务列表...)"

# 输出

- **路径**: `char/脚本/Zod.ts`
- **格式**: TypeScript 文件, 包含:
  - 第一行必须是：`import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';`
  - 顶层辅助 const（可选，用于复用子 schema）
  - `export const Schema = z.object({...})`
  - `export type Schema = z.output<typeof Schema>`
  - 最后必须是：`$(() => { registerMvuSchema(Schema); });`

# 文件骨架

```ts
import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

// 可选：在此定义复用的子 schema const，如枚举、通用结构体等
// const ItemSchema = z.object({ 描述: z.string().prefault('无描述'), 数量: z.coerce.number().prefault(1) });

export const Schema = z.object({
  世界: z.object({
    当前时间: z.string(),
    当前地点: z.string(),
    近期事务: z.record(z.string().describe('事务名'), z.string().describe('事务描述')),
  }),

  主角: z.object({
    物品栏: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  // 其他 NPC、关系等字段
});
export type Schema = z.output<typeof Schema>;

$(() => {
  registerMvuSchema(Schema);
});
```

# Zod Schema 编写规则(完整内嵌)

> 详细规则参考 `.opencode/instructions/mvu-schema-rules.md`。下面是核心规则的内嵌副本。

## 库可用性

- `z` (zod 4.x) 全局可用,**禁止** import
- `_` (lodash) 全局可用,**禁止** import
- 使用 zod 4.x 而非 3.x

## 幂等性

`Schema.parse(Schema.parse(x)) === Schema.parse(x)`。使用 `z.transform` 时务必保持幂等。

## 数字字段

期望数字时用 `z.coerce.number()`,不用 `z.number()`。但 boolean 直接用 `z.boolean()`,不用 `z.coerce.boolean()`。

## 优先 object 而非 array

```ts
// ❌
物品栏: z.array(z.object({ 名称: z.string(), 描述: z.string() }));
// ✅
物品栏: z.record(z.string().describe('物品名'), z.object({ 描述: z.string() }));
```

## Object schema 形式选择

| 场景                | 写法                                         |
| ------------------- | -------------------------------------------- |
| 固定必需键+同类型   | `z.record(z.enum(['k1','k2']), 类型)`        |
| 固定可选键+同类型   | `z.partialRecord(z.enum(['k1','k2']), 类型)` |
| 动态可选键+同类型   | `z.record(z.string(), 类型)`                 |
| 固定必需键+不同类型 | `z.object({k1: 类型 1, k2: 类型 2})`         |

## 可清空对象

如果对象可被 JSON patch 清空,用 `prefault({})` 而非 `optional()`,且其所有字段也要 prefault。

## 限制(restrictions)

仅当用户明确请求时施加限制,优先用 `z.transform` 修正而非 `min()/max()` 拒绝:

```ts
// ✅
好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100));
// ❌(用户未要求严格拒绝时)
好感度: z.coerce.number().min(0).max(100);
```

## describe

仅当字段名无法解释用途时(如 record 的动态 key)才用 `z.describe`。

## 函数禁忌

- `z.transform(fn)` 的 fn 只接收 parsed output,不要用 context 参数
- `z.prefault(value)` 的 value 必须是 schema 自己的合法输入
- `z.extend` 仅 `z.object/looseObject/strictObject` 可用,`prefault({})` 后不能 extend
- **禁用** `z.passthrough` / `z.strict`(它们不存在)

# 强制规则

## 字段命名

- 顶层 key 必须用中文(如 `世界`、`某 NPC 名`、`主角`)
- 变量键名**绝对禁止**使用 `user` 或 `{{user}}`，遇到玩家相关的键名**必须**使用名词 `主角` 代替。
- 嵌套字段名用中文短词(如 `好感度`、`物品栏`、`着装`)

## {{user}} 替换

`Zod.ts` 是代码文件,字段名/标识符可以是任何合法 TS 标识符。但:

- 字符串 `describe` 内容里若涉及"主角"指代,改为 `{{user}}` 字面字符串
- 例:`z.string().describe('{{user}} 对该称号的评价')` 而非 `z.string().describe('主角对该称号的评价')`

## 文件结构

文件按以下固定顺序组织，不得颠倒：

1. **第一行**：`import { registerMvuSchema } from '...'`
2. **中间（可选）**：顶层辅助 `const`，用于定义复用的子 schema（枚举、通用结构体等）
3. **`export const Schema = z.object({...})`**
4. **`export type Schema = z.output<typeof Schema>`**
5. **最后**：`$(() => { registerMvuSchema(Schema); });`

除以上内容外，**不**写其他副作用代码。

## 不生成 schema.json

- 不生成 schema.json 文件
- 不在其他文件首行添加 `# yaml-language-server: $schema=...` 注释

## 与已有内容一致

- 顶层 NPC 字段名应当与 `char/世界书/NPC/` 下的文件名(去除 .md)对应
- `所属势力`、`称号` 等字段值若与世界设定/势力设定相关,需保持引用一致
- 物品、能力等字段名应在世界设定的物理规则范围内合理

## 格式

- TypeScript 语法正确,可被 webpack 编译
- 缩进统一(2 空格)
- 严格遵守"文件结构"规则中规定的顺序

# 思维链

1. 用 Read 工具读取所有已生成的世界书条目(world / factions / 主角设定 / NPC × N / drama)
2. 询问/确认要追踪的状态维度
3. 对每个维度,设计合适的 zod 类型
   - 数字 → `z.coerce.number()`,需要范围限制时用 `transform(clamp)`
   - 动态 key 对象 → `z.record(z.string().describe('xxx'), 类型)`
   - 固定 key 对象 → `z.record(z.enum([...]), 类型)` 或 `z.object({...})`
4. 起草 TS 代码
5. 自检:幂等性、字段命名、函数用法、是否有禁用 API
6. 自检:`describe` 字符串中是否有"主角/用户"等禁词
7. 写入 `char/脚本/Zod.ts`
8. 输出 schema 摘要(顶层字段列表)

# 自检清单

- [ ] 文件路径为 `char/脚本/Zod.ts`
- [ ] 第一行是
      `import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';`
- [ ] 文件结构顺序正确：import → 辅助 const（可选）→ export const Schema → export type Schema → $(() => { registerMvuSchema(Schema); })
- [ ] 结尾有 `$(() => { registerMvuSchema(Schema); });`
- [ ] 数字用 `z.coerce.number()`,boolean 用 `z.boolean()`
- [ ] 数组优先改为 `z.record`
- [ ] `describe` 字符串内无"主角/用户"等禁词,改用 `{{user}}`
- [ ] 没有用 `z.passthrough` / `z.strict`
- [ ] 没有用 context 参数的 transform
- [ ] 顶层字段名必须用 `主角` 而非 `user` 或 `{{user}}`
- [ ] 所有 NPC 字段名与 `char/世界书/NPC/` 下文件名对应
- [ ] TS 语法正确(没有未闭合的括号)
