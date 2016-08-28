# bear-sql-migrator

Database migration and visualization tool

## intro

Bear-sql-migrator is a cli tool for sql database migrations

## installation

install with npm

```
npm install git@github.com:hack-bear/bear-sql-migrator.git -g
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
    {
      "key": "title",
      "comment": "商店名称",
      "type": "varchar(255)",
      "notNull": true
    },
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

generate migration files
```
bsqlm -d -i [input folder of database config & table definitions] -o [output folder for migration files]
```

database migration
```
bsqlm -m [version] -o [output folder for migration files]: migrate database to certain version
bsqlm -m [version] -o [output folder for migration files] -f: fake migration
```

## contributor

hack-bear@github
