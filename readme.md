# API Document

## Model

### List for items

```json
{
  "result": Array Of Items,
  "count": Integer
}
```

### Lis for single item

```json
{
  "result": Item,
  "count": Integer
}
```

### Item

```json
{
  "todo": String,
  "id": Integer,
  "checked": Boolean
}
```

### Error

```json
{
  "message": String
}
```

## GET /lists

取得完整 Todo list。

### Response Type : JSON

200: successful operation
|Status Code|Description|
|---|---|
|200|Successful operation|
|500|Error occurred while reading file|

## GET /lists/{id}

取得單一 Todo item。

### Parameters Type : Query String

| Param. Name | Description               |
| ----------- | ------------------------- |
| id          | Item id you want to fetch |

### Response Type : JSON

200: successful operation
|Status Code|Description|
|---|---|
|200|Successful operation|
|400|Item not found|
|500|Error occurred while reading file|

## POST /lists

 新增一筆 Todo list。

### Parameters Type : Request body

| Param. Name | Description  |
| ----------- | ------------ |
| todo        | Todo content |

### Response Type : JSON

200: successful operation
|Status Code|Description|
|---|---|
|200|Successful operation|
|400|Bad input|
|500|Error occurred while reading file|

## PATCH /lists/{id}

改變一筆 Todo item 的 Checked 狀態。

### Parameters Type : Request body

| Param. Name | Description                |
| ----------- | -------------------------- |
| id          | Item id you want to change |

### Response Type : JSON

200: successful operation
|Status Code|Description|
|---|---|
|200|Successful operation|
|400|Bad input|
|500|Error occurred while reading file|
