# bear-sql-migrator

Database migration tool

## intro

Bear-sql-migrator is a cli tool for sql database migrations

## installation

install with npm

```
npm install https://github.com/hack-bear/bear-sql-migrator.git -g
```

database config & table definitions should under the same folder which -i provides
```
_defs.json:
{
  "tablePrefix": "hackbear_",
  "config": {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "hackbear",
    "port": 3306
  }
}

table definitions (eg. Shop.json):
{
  "name": "shop",
  "fields": [
    {
      "key": "id",
      "comment": "主键",
      "type": "int(10) unsigned",
      "notNull": true,
      "settings": ["AUTO_INCREMENT"]
    },

    ...

    {
      "key": "recommended",
      "comment": "是否推荐",
      "type": "tinyint(2)",
      "default": "0"
    }
  ],
  "settings": [
    ["PRIMARY KEY", "(`id`)"],
    ["INDEX", "recommended", "recommended"]
  ],
  "ENGINE": "MyISAM",
  "CHARSET": "utf8"
}

```

generate definition files from db:
```
bsqlm -g -i [path]
```

generate migration files:
```
bsqlm -d -i [path] -o [path]
```

database migration:
```
bsqlm -m [version] -o [path]: migrate database to certain version
```

parameters:
```
-m --migrate [version]: Migrate to version [version]
-g --generate: Generate the table definitions from db
-d --diff: Diff the table definitions with db and generate migration files
-i --input [path]: Path of db config & table definitions, defaults to ./classes
-o --output [path]: Path of migration files, defaults to ./migrations
-f --fake: Fake migration which only changes the record of migration version but not tables
```

table definition:
```
name: table name (without prefix)
fields: table columns
  key: column name
  type: column type, eg. "int(10) unsigned"
  default: default value, eg "0", defaults to null
  notNull: defaults to false
  settings: eg. ["AUTO_INCREMENT"], defaults to null
  comment: column comment, default to null
settings: 
  ["PRIMARY KEY", "(`id`)"]: set id as primary key
  ["INDEX", "shop_recommend", "shop_id,is_recommend"]: create index named "shop_recommend" on shop_id and is_recommend
```

## contributor

hack-bear@github
