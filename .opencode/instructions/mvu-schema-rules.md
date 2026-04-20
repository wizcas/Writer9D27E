# MVU Zod Schema 编写规则

> 本文件为人类可读的规则参考手册。CardMvuSchema agent 提示词中应内嵌本规则的副本。修改本文件时,需同步更新 agent。

## 概述

`char/脚本/Zod.ts` 文件用 zod 4.x 库定义 MVU 变量结构。该 schema 同时被脚本、前端界面、initvar 文件、变量更新规则文件引用,是 MVU 角色卡的"数据结构契约"。

## 文件骨架

```ts
export const Schema = z.object({
  // 顶层字段定义
});
export type Schema = z.output<typeof Schema>;
```

## 库可用性

- `z` (zod 4.x) 全局可用,**禁止** import
- `_` (lodash) 全局可用,**禁止** import
- 务必使用 zod 4.x 而非 3.x

## 核心规则

### 1. 幂等性

`Schema.parse(input)` 的输出必须能再次作为 `Schema.parse` 的输入。即:

```
Schema.parse(Schema.parse(x)) === Schema.parse(x)
```

使用 `z.transform` 时务必小心保持幂等性。

### 2. 数字字段

期望数字时,优先用 `z.coerce.number()` 而非 `z.number()`,因为前者会尝试将非数字输入(如字符串"30")转为数字。

```ts
好感度: z.coerce.number()
```

但**不要**对 boolean 用 `z.coerce.boolean()`,直接 `z.boolean()`。

### 3. 优先 object schema 而非 array schema

数组索引难以理解和维护,应该用对象 schema 替代。

```ts
// ❌ 不推荐
物品栏: z.array(z.object({ 名称: z.string(), 描述: z.string() }))

// ✅ 推荐
物品栏: z.record(
  z.string().describe('物品名'),
  z.object({ 描述: z.string() })
)
```

### 4. Object schema 的形式选择

| 场景 | 写法 |
|------|------|
| 固定必需键 + 同类型 | `z.record(z.enum(['k1', 'k2']), 类型)` |
| 固定可选键 + 同类型 | `z.partialRecord(z.enum(['k1', 'k2']), 类型)` |
| 动态可选键 + 同类型 | `z.record(z.string(), 类型)` |
| 固定必需键 + 不同类型 | `z.object({ k1: 类型 1, k2: 类型 2 })` |
| 动态键 + 部分键必需 + 同类型 | `z.intersection(z.object({...}), z.record(z.string(), 类型))` |

### 5. 可清空对象的写法

如果某对象可被 JSON patch `{"op":"remove","path":"/path"}` 清空,使用 `prefault({})` 而非 `optional()`,以更好地兼容增量更新:

```ts
// ✅ 推荐
某可清空对象: z.object({
  字段 1: z.string().prefault(''),
  字段 2: z.coerce.number().prefault(0),
}).prefault({})

// ❌ 不推荐
某可清空对象: z.object({...}).optional()
```

### 6. 特殊格式

罕见情况:模板字符串格式优先用 `z.templateLiteral` 而非 regex 或手动解析。

### 7. 限制(restrictions)

当输入会破坏 schema 时,用户期望该更新仍能"部分生效"而非整体丢弃。优先用 `z.transform` 修正而非 `min()/max()` 直接拒绝:

```ts
// ✅ 推荐:超界时夹紧到合法范围
好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100))

// ❌ 不推荐:超界时整个 parse 失败
好感度: z.coerce.number().min(0).max(100)
```

如果某对象只能容纳 10 个键,新键到来时丢弃最旧的而非拒绝:

```ts
称号: z.record(z.string(), z.string()).transform(data =>
  _(data).entries().takeRight(10).fromPairs().value()
)
```

**注意:仅当用户明确请求这些限制时才施加。**

### 8. 默认值

- 优先用 `z.prefault` 而非 `z.default`
- 复杂的 `z.object` 或整个 Schema,给每个字段都设 `.prefault(...)` 或 `.or(z.literal('待初始化')).prefault('待初始化')`
- 复合类型 prefault 时,其所有字段也要 prefault
- 其他情况除非用户要求否则不设 prefault

### 9. describe 的使用

仅当字段名无法解释用途时才用 `z.describe`(典型场景:`z.record` 的 key 类型)。

```ts
// ✅ 推荐
物品栏: z.record(
  z.string().describe('物品名'),       // 字段名是动态字符串,需要描述
  z.object({ 描述: z.string() })       // 字段名"描述"已经自解释,不需要 describe
)
```

### 10. 键的顺序

如果用户要求按"插入时间"操作键,优先用 `_(data).entries()` 等(几乎总按插入顺序列出)。需要时间戳字段时:

```ts
$time: z.coerce.number().prefault(() => Date.now())
```

### 11. 不要重复

合并相同的变量 schema。但**不要**为此定义额外变量 — 只能在 `export const Schema = z.object({...})` 内部定义。

## 函数说明与禁忌

### z.transform

```ts
type: (fn: (value: Output) => NewOutput) => z.ZodType
```

- `fn` 只接受 parsed output 作为输入,**禁止**用 `context` 参数
- ✅ `z.string().transform(value => value)`
- ❌ `z.string().transform((value, context) => value)`

### z.prefault

```ts
type: (value: Input | (() => Input)) => z.ZodType
```

- `value` 必须是该 schema 自己的合法输入
- ✅ `z.object({ 好感度: z.coerce.number().prefault(0) }).prefault({})`
- ❌ `z.object({ 好感度: z.coerce.number() }).prefault({})` (此时输入必须含 `好感度` 字段)

### z.extend

- 仅 `z.object` / `z.looseObject` / `z.strictObject` 可被扩展
- ✅ `z.object({...}).extend({...})`
- ❌ `z.object({...}).prefault({}).extend({...})`

### z.passthrough / z.strict

不存在,**禁止使用**。

## 完整示例(参考自示例角色卡)

```ts
export const Schema = z.object({
  世界: z.object({
    当前时间: z.string(),
    当前地点: z.string(),
    近期事务: z.record(z.string().describe('事务名'), z.string().describe('事务描述')),
  }),

  某角色: z.object({
    好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)),
    着装: z.record(z.enum(['上装', '下装', '内衣', '袜子', '鞋子', '饰品']), z.string().describe('服装描述')),
    称号: z.record(
      z.string().describe('称号名'),
      z.object({
        效果: z.string(),
        自我评价: z.string(),
      }),
    ),
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
});
export type Schema = z.output<typeof Schema>;
```

## 关于"主角"字段名

由于本项目要求正文中替换“主角”为 `{{user}}`，但 schema.ts **是 MVU 变量定义代码文件**。根据全局规范：

- 变量键名**绝对禁止**使用 `user` 或 `{{user}}`。
- 遇到玩家相关的键名**必须**统一使用名词 `主角` 代替（如 `主角: z.object(...)`）。
- 变量的值（如 `describe()` 内的说明）必须使用 `{{user}}`。

## 输出位置

文件路径:`char/脚本/Zod.ts`

不生成 `schema.json` 文件;不在 initvar 等文件首行添加 `# yaml-language-server: $schema=...` 注释。
